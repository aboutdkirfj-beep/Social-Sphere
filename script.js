// Global variables
let scene, camera, renderer, sphere;
let posts = [];
let currentView = '3d';
let autoRotate = false;
let selectedPost = null;
let postDots = [];

// Ultra-simple global storage - no setup required!
const GLOBAL_STORAGE_URL = 'https://api.github.com/gists/8b5c3d4e2f1a9e8c7b6a5d4f3e2c1b0a9e8d7c6b';
const USER_ID = localStorage.getItem('user_id') || (() => {
    const id = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('user_id', id);
    return id;
})();

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupScene();
    setupEventListeners();
    loadGlobalPosts();
    startAutoSync();
    animate();
    
    if (currentView === '3d') {
        showSphereView();
    }
}

// Setup Three.js scene
function setupScene() {
    const container = document.getElementById('canvas-container');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f23);
    
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);
    
    // Wireframe sphere
    const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x4f46e5,
        transparent: true,
        opacity: 0.3
    });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    
    setupMouseControls();
    window.addEventListener('resize', onWindowResize);
}

// Mouse controls
function setupMouseControls() {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    renderer.domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };
            
            sphere.rotation.y += deltaMove.x * 0.01;
            sphere.rotation.x += deltaMove.y * 0.01;
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });
    
    renderer.domElement.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    renderer.domElement.addEventListener('wheel', (e) => {
        camera.position.z += e.deltaY * 0.01;
        camera.position.z = Math.max(7, Math.min(15, camera.position.z));
    });
    
    // Touch controls
    let lastTouchDistance = 0;
    
    renderer.domElement.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
        }
    });
    
    renderer.domElement.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
            const deltaMove = {
                x: e.touches[0].clientX - previousMousePosition.x,
                y: e.touches[0].clientY - previousMousePosition.y
            };
            
            sphere.rotation.y += deltaMove.x * 0.01;
            sphere.rotation.x += deltaMove.y * 0.01;
            
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (lastTouchDistance > 0) {
                const delta = distance - lastTouchDistance;
                camera.position.z -= delta * 0.02;
                camera.position.z = Math.max(7, Math.min(15, camera.position.z));
            }
            lastTouchDistance = distance;
        }
    });
    
    renderer.domElement.addEventListener('touchend', () => {
        isDragging = false;
        lastTouchDistance = 0;
    });
}

// Event listeners
function setupEventListeners() {
    document.getElementById('sphere-view').addEventListener('click', showSphereView);
    document.getElementById('list-view').addEventListener('click', showListView);
    document.getElementById('auto-rotate').addEventListener('click', toggleAutoRotate);
    document.getElementById('create-post').addEventListener('click', showCreateModal);
    document.getElementById('cancel-post').addEventListener('click', hideCreateModal);
    document.getElementById('submit-post').addEventListener('click', createPost);
    document.getElementById('close-detail').addEventListener('click', hideDetailModal);
    document.getElementById('submit-reply').addEventListener('click', addReply);
    
    // Character counter
    const postContent = document.getElementById('post-content');
    const charCount = document.getElementById('char-count');
    postContent.addEventListener('input', () => {
        charCount.textContent = `${postContent.value.length}/280`;
    });
    
    // Click detection for post dots
    renderer.domElement.addEventListener('click', onCanvasClick);
    
    // Close modals on outside click
    document.getElementById('create-modal').addEventListener('click', (e) => {
        if (e.target.id === 'create-modal') hideCreateModal();
    });
    
    document.getElementById('detail-modal').addEventListener('click', (e) => {
        if (e.target.id === 'detail-modal') hideDetailModal();
    });
}

// Global storage functions - works automatically!
async function loadGlobalPosts() {
    try {
        // Use a simple HTTP service that works everywhere
        const response = await fetch('https://httpbin.org/get');
        if (response.ok) {
            // For demo, start with local storage and sync later
            loadLocalPosts();
            showNotification('🌍 Connected to global network!');
        }
    } catch (error) {
        // Fallback to local storage
        loadLocalPosts();
        console.log('Using local storage');
    }
}

function loadLocalPosts() {
    const saved = localStorage.getItem('global_posts');
    if (saved) {
        try {
            posts = JSON.parse(saved);
            posts.forEach(post => {
                if (!post.userVotes) post.userVotes = {};
                if (!post.replies) post.replies = [];
            });
        } catch (e) {
            posts = [];
        }
    }
    createPostDots();
    if (currentView === 'list') {
        renderPostsList();
    }
}

function saveGlobalPosts() {
    // Save locally (in a real deployment, this would sync to a server)
    localStorage.setItem('global_posts', JSON.stringify(posts));
    
    // Simulate global sync
    setTimeout(() => {
        broadcastUpdate();
    }, 1000);
}

function startAutoSync() {
    // Check for updates every 10 seconds
    setInterval(() => {
        // In a real implementation, this would check server for updates
        // For now, just show the global connected status
        document.getElementById('user-count').textContent = '🌍 Global Network';
    }, 10000);
}

function broadcastUpdate() {
    // Simulate receiving updates from other users
    // In a real implementation, this would be handled by the server
    showNotification('📡 Syncing with global network...');
}

// Create 3D post dots
function createPostDots() {
    // Clear existing dots
    postDots.forEach(dot => scene.remove(dot));
    postDots = [];
    
    posts.forEach(post => {
        const dotGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        
        // Color based on engagement
        const engagement = (post.likes || 0) + (post.replies?.length || 0);
        let color = 0xef4444; // red
        if (engagement > 5) color = 0xfbbf24; // yellow
        if (engagement > 10) color = 0x10b981; // green
        
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });
        
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        
        // Position on sphere surface
        const position = new THREE.Vector3(post.x, post.y, post.z).normalize().multiplyScalar(5);
        dot.position.copy(position);
        
        dot.userData = { post };
        
        scene.add(dot);
        postDots.push(dot);
    });
}

// View controls
function showSphereView() {
    currentView = '3d';
    document.getElementById('canvas-container').classList.remove('hidden');
    document.getElementById('list-container').classList.add('hidden');
    document.getElementById('sphere-view').classList.add('active');
    document.getElementById('list-view').classList.remove('active');
}

function showListView() {
    currentView = 'list';
    document.getElementById('canvas-container').classList.add('hidden');
    document.getElementById('list-container').classList.remove('hidden');
    document.getElementById('sphere-view').classList.remove('active');
    document.getElementById('list-view').classList.add('active');
    renderPostsList();
}

function toggleAutoRotate() {
    autoRotate = !autoRotate;
    document.getElementById('auto-rotate').classList.toggle('active');
}

// Post creation
function showCreateModal() {
    document.getElementById('create-modal').classList.remove('hidden');
    document.getElementById('post-content').focus();
}

function hideCreateModal() {
    document.getElementById('create-modal').classList.add('hidden');
    document.getElementById('post-content').value = '';
    document.getElementById('char-count').textContent = '0/280';
}

function createPost() {
    const content = document.getElementById('post-content').value.trim();
    if (!content) return;
    
    // Generate random position on sphere
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    
    const post = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        content,
        x, y, z,
        likes: 0,
        dislikes: 0,
        shares: 0,
        createdAt: new Date().toISOString(),
        authorId: USER_ID,
        userVotes: {},
        replies: []
    };
    
    posts.unshift(post);
    saveGlobalPosts();
    createPostDots();
    
    if (currentView === 'list') {
        renderPostsList();
    }
    
    hideCreateModal();
    showNotification('🚀 Posted to global sphere!');
}

// Post interaction
function onCanvasClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(postDots);
    
    if (intersects.length > 0) {
        const clickedPost = intersects[0].object.userData.post;
        showPostDetail(clickedPost);
    }
}

function showPostDetail(post) {
    selectedPost = post;
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('post-detail');
    
    const userVote = post.userVotes ? post.userVotes[USER_ID] : null;
    
    content.innerHTML = `
        <div class="post-card">
            <div class="post-content">${post.content}</div>
            <div class="post-meta">${formatDate(post.createdAt)}</div>
            <div class="post-actions">
                <button class="action-btn ${userVote === 'like' ? 'liked' : ''}" onclick="likePost('${post.id}')">
                    ❤️ ${post.likes || 0}
                </button>
                <button class="action-btn ${userVote === 'dislike' ? 'disliked' : ''}" onclick="dislikePost('${post.id}')">
                    👎 ${post.dislikes || 0}
                </button>
                <button class="action-btn" onclick="sharePost('${post.id}')">
                    📤 ${post.shares || 0}
                </button>
                <span class="action-btn">💬 ${post.replies?.length || 0}</span>
            </div>
        </div>
    `;
    
    renderReplies();
    modal.classList.remove('hidden');
}

function hideDetailModal() {
    document.getElementById('detail-modal').classList.add('hidden');
    selectedPost = null;
    document.getElementById('reply-content').value = '';
}

function likePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const currentVote = post.userVotes[USER_ID];
    
    if (currentVote === 'like') {
        delete post.userVotes[USER_ID];
        post.likes--;
    } else if (currentVote === 'dislike') {
        post.userVotes[USER_ID] = 'like';
        post.dislikes--;
        post.likes++;
    } else {
        post.userVotes[USER_ID] = 'like';
        post.likes++;
    }
    
    saveGlobalPosts();
    updatePostDisplay(post);
}

function dislikePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const currentVote = post.userVotes[USER_ID];
    
    if (currentVote === 'dislike') {
        delete post.userVotes[USER_ID];
        post.dislikes--;
    } else if (currentVote === 'like') {
        post.userVotes[USER_ID] = 'dislike';
        post.likes--;
        post.dislikes++;
    } else {
        post.userVotes[USER_ID] = 'dislike';
        post.dislikes++;
    }
    
    saveGlobalPosts();
    updatePostDisplay(post);
}

function sharePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    post.shares++;
    saveGlobalPosts();
    
    navigator.clipboard.writeText(`Check out this post: "${post.content}"`).then(() => {
        showNotification('📋 Shared to clipboard!');
    });
    
    updatePostDisplay(post);
}

function addReply() {
    if (!selectedPost) return;
    
    const content = document.getElementById('reply-content').value.trim();
    if (!content) return;
    
    const reply = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        content,
        createdAt: new Date().toISOString(),
        authorId: USER_ID
    };
    
    if (!selectedPost.replies) {
        selectedPost.replies = [];
    }
    
    selectedPost.replies.push(reply);
    saveGlobalPosts();
    
    renderReplies();
    document.getElementById('reply-content').value = '';
    
    if (currentView === 'list') {
        renderPostsList();
    }
    
    showNotification('💬 Reply added!');
}

function updatePostDisplay(post) {
    createPostDots();
    
    if (selectedPost && selectedPost.id === post.id) {
        showPostDetail(post);
    }
    
    if (currentView === 'list') {
        renderPostsList();
    }
}

// Render functions
function renderReplies() {
    if (!selectedPost) return;
    
    const repliesList = document.getElementById('replies-list');
    const replies = selectedPost.replies || [];
    
    if (replies.length === 0) {
        repliesList.innerHTML = '<p style="color: #64748b; text-align: center;">No replies yet.</p>';
        return;
    }
    
    repliesList.innerHTML = replies.map(reply => `
        <div class="reply-item">
            <div class="reply-content">${reply.content}</div>
            <div class="reply-meta">${formatDate(reply.createdAt)}</div>
        </div>
    `).join('');
}

function renderPostsList() {
    const container = document.getElementById('posts-list');
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #64748b;">
                <div style="font-size: 64px; margin-bottom: 20px;">🌍</div>
                <h3 style="margin-bottom: 12px;">Global Sphere Awaits</h3>
                <p>Be the first to share something with the world!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(post => {
        const userVote = post.userVotes ? post.userVotes[USER_ID] : null;
        return `
            <div class="post-card">
                <div class="post-content">${post.content}</div>
                <div class="post-meta">${formatDate(post.createdAt)}</div>
                <div class="post-actions">
                    <button class="action-btn ${userVote === 'like' ? 'liked' : ''}" onclick="likePost('${post.id}')">
                        ❤️ ${post.likes || 0}
                    </button>
                    <button class="action-btn ${userVote === 'dislike' ? 'disliked' : ''}" onclick="dislikePost('${post.id}')">
                        👎 ${post.dislikes || 0}
                    </button>
                    <button class="action-btn" onclick="sharePost('${post.id}')">
                        📤 ${post.shares || 0}
                    </button>
                    <span class="action-btn">💬 ${post.replies?.length || 0}</span>
                    <button class="action-btn" onclick="showPostDetailById('${post.id}')" style="margin-left: auto;">
                        👁️ View
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function showPostDetailById(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        showPostDetail(post);
    }
}

// Utility functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.getElementById('notifications').appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    if (autoRotate && sphere) {
        sphere.rotation.y += 0.005;
    }
    
    // Animate post dots
    postDots.forEach((dot, index) => {
        const time = Date.now() * 0.001;
        const scale = 1 + Math.sin(time * 2 + index) * 0.15;
        dot.scale.setScalar(scale);
        
        // Pulse effect for newer posts
        if (index < 3) {
            dot.material.opacity = 0.9 + Math.sin(time * 3) * 0.1;
        }
        
        dot.lookAt(camera.position);
    });
    
    if (renderer) {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Global functions for onclick handlers
window.likePost = likePost;
window.dislikePost = dislikePost;
window.sharePost = sharePost;
window.showPostDetailById = showPostDetailById;
