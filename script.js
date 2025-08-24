// Global variables
let scene, camera, renderer, sphere, controls;
let posts = [];
let currentView = '3d';
let autoRotate = false;
let selectedPost = null;
let postDots = [];

// User ID for anonymous voting
const USER_ID = localStorage.getItem('socialSphere_userId') || (() => {
    const id = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('socialSphere_userId', id);
    return id;
})();

// Initialize the application
function init() {
    loadPosts();
    setupScene();
    setupEventListeners();
    animate();
    
    if (currentView === '3d') {
        showSphereView();
    } else {
        showListView();
    }
}

// Setup Three.js scene
function setupScene() {
    const container = document.getElementById('canvas-container');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f23);
    
    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);
    
    // Renderer
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
    
    // Mouse controls
    setupMouseControls();
    
    // Create post dots
    createPostDots();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Setup mouse controls for 3D navigation
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
    
    // Zoom with mouse wheel
    renderer.domElement.addEventListener('wheel', (e) => {
        camera.position.z += e.deltaY * 0.01;
        camera.position.z = Math.max(7, Math.min(15, camera.position.z));
    });
    
    // Touch controls for mobile
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

// Create 3D post dots
function createPostDots() {
    // Clear existing dots
    postDots.forEach(dot => scene.remove(dot));
    postDots = [];
    
    posts.forEach(post => {
        const dotGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: 0xef4444,
            transparent: true,
            opacity: 0.8
        });
        
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        
        // Position on sphere surface
        const position = new THREE.Vector3(post.x, post.y, post.z).normalize().multiplyScalar(5);
        dot.position.copy(position);
        
        // Store post reference
        dot.userData = { post };
        
        scene.add(dot);
        postDots.push(dot);
    });
}

// Setup event listeners
function setupEventListeners() {
    // View toggle buttons
    document.getElementById('sphere-view').addEventListener('click', showSphereView);
    document.getElementById('list-view').addEventListener('click', showListView);
    
    // Auto rotate button
    document.getElementById('auto-rotate').addEventListener('click', () => {
        autoRotate = !autoRotate;
        document.getElementById('auto-rotate').classList.toggle('active');
    });
    
    // Create post button
    document.getElementById('create-post-btn').addEventListener('click', showCreateModal);
    
    // Modal controls
    document.getElementById('cancel-post').addEventListener('click', hideCreateModal);
    document.getElementById('submit-post').addEventListener('click', createPost);
    document.getElementById('close-detail').addEventListener('click', hideDetailModal);
    document.getElementById('submit-reply').addEventListener('click', addReply);
    
    // Post content character counter
    const postContent = document.getElementById('post-content');
    const charCount = document.getElementById('char-count');
    postContent.addEventListener('input', () => {
        charCount.textContent = `${postContent.value.length}/280`;
    });
    
    // Click detection for post dots
    renderer.domElement.addEventListener('click', onCanvasClick);
    
    // Close modals when clicking outside
    document.getElementById('create-modal').addEventListener('click', (e) => {
        if (e.target.id === 'create-modal') hideCreateModal();
    });
    
    document.getElementById('detail-modal').addEventListener('click', (e) => {
        if (e.target.id === 'detail-modal') hideDetailModal();
    });
}

// Handle canvas clicks for post selection
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

// Show sphere view
function showSphereView() {
    currentView = '3d';
    document.getElementById('canvas-container').classList.remove('hidden');
    document.getElementById('list-container').classList.add('hidden');
    document.getElementById('sphere-view').classList.add('active');
    document.getElementById('list-view').classList.remove('active');
}

// Show list view
function showListView() {
    currentView = 'list';
    document.getElementById('canvas-container').classList.add('hidden');
    document.getElementById('list-container').classList.remove('hidden');
    document.getElementById('sphere-view').classList.remove('active');
    document.getElementById('list-view').classList.add('active');
    renderPostsList();
}

// Show create post modal
function showCreateModal() {
    document.getElementById('create-modal').classList.remove('hidden');
    document.getElementById('post-content').focus();
}

// Hide create post modal
function hideCreateModal() {
    document.getElementById('create-modal').classList.add('hidden');
    document.getElementById('post-content').value = '';
    document.getElementById('char-count').textContent = '0/280';
}

// Create new post
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
        id: Date.now(),
        content,
        x, y, z,
        likes: 0,
        dislikes: 0,
        replies: 0,
        shares: 0,
        createdAt: new Date().toISOString(),
        userVotes: {},
        postReplies: []
    };
    
    posts.unshift(post);
    savePosts();
    createPostDots();
    
    if (currentView === 'list') {
        renderPostsList();
    }
    
    hideCreateModal();
}

// Show post detail modal
function showPostDetail(post) {
    selectedPost = post;
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('post-detail-content');
    
    const userVote = post.userVotes[USER_ID] || null;
    
    content.innerHTML = `
        <div class="post-card">
            <div class="post-content">${post.content}</div>
            <div class="post-meta">${formatDate(post.createdAt)}</div>
            <div class="post-actions">
                <button class="action-btn ${userVote === 'like' ? 'liked' : ''}" onclick="likePost(${post.id})">
                    ❤️ ${post.likes}
                </button>
                <button class="action-btn ${userVote === 'dislike' ? 'disliked' : ''}" onclick="dislikePost(${post.id})">
                    👎 ${post.dislikes}
                </button>
                <button class="action-btn" onclick="sharePost(${post.id})">
                    📤 ${post.shares}
                </button>
                <span class="action-btn">💬 ${post.replies}</span>
            </div>
        </div>
    `;
    
    renderReplies();
    modal.classList.remove('hidden');
}

// Hide post detail modal
function hideDetailModal() {
    document.getElementById('detail-modal').classList.add('hidden');
    selectedPost = null;
    document.getElementById('reply-content').value = '';
}

// Like post
function likePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const currentVote = post.userVotes[USER_ID];
    
    if (currentVote === 'like') {
        // Remove like
        delete post.userVotes[USER_ID];
        post.likes--;
    } else if (currentVote === 'dislike') {
        // Change from dislike to like
        post.userVotes[USER_ID] = 'like';
        post.dislikes--;
        post.likes++;
    } else {
        // Add like
        post.userVotes[USER_ID] = 'like';
        post.likes++;
    }
    
    savePosts();
    
    if (selectedPost && selectedPost.id === postId) {
        showPostDetail(post);
    }
    
    if (currentView === 'list') {
        renderPostsList();
    }
}

// Dislike post
function dislikePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const currentVote = post.userVotes[USER_ID];
    
    if (currentVote === 'dislike') {
        // Remove dislike
        delete post.userVotes[USER_ID];
        post.dislikes--;
    } else if (currentVote === 'like') {
        // Change from like to dislike
        post.userVotes[USER_ID] = 'dislike';
        post.likes--;
        post.dislikes++;
    } else {
        // Add dislike
        post.userVotes[USER_ID] = 'dislike';
        post.dislikes++;
    }
    
    savePosts();
    
    if (selectedPost && selectedPost.id === postId) {
        showPostDetail(post);
    }
    
    if (currentView === 'list') {
        renderPostsList();
    }
}

// Share post
function sharePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    post.shares++;
    savePosts();
    
    // Copy link to clipboard (simplified)
    navigator.clipboard.writeText(`Check out this post: "${post.content}"`).then(() => {
        alert('Post shared to clipboard!');
    });
    
    if (selectedPost && selectedPost.id === postId) {
        showPostDetail(post);
    }
    
    if (currentView === 'list') {
        renderPostsList();
    }
}

// Add reply to post
function addReply() {
    if (!selectedPost) return;
    
    const content = document.getElementById('reply-content').value.trim();
    if (!content) return;
    
    const reply = {
        id: Date.now(),
        content,
        createdAt: new Date().toISOString()
    };
    
    if (!selectedPost.postReplies) {
        selectedPost.postReplies = [];
    }
    
    selectedPost.postReplies.push(reply);
    selectedPost.replies++;
    
    savePosts();
    renderReplies();
    document.getElementById('reply-content').value = '';
    
    if (currentView === 'list') {
        renderPostsList();
    }
}

// Render replies in detail modal
function renderReplies() {
    if (!selectedPost) return;
    
    const repliesList = document.getElementById('replies-list');
    const replies = selectedPost.postReplies || [];
    
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

// Render posts list view
function renderPostsList() {
    const container = document.getElementById('posts-list');
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #64748b;">
                <div style="font-size: 48px; margin-bottom: 16px;">🌐</div>
                <h3>No posts yet</h3>
                <p>Be the first to share something on the sphere!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(post => {
        const userVote = post.userVotes[USER_ID] || null;
        return `
            <div class="post-card">
                <div class="post-content">${post.content}</div>
                <div class="post-meta">${formatDate(post.createdAt)}</div>
                <div class="post-actions">
                    <button class="action-btn ${userVote === 'like' ? 'liked' : ''}" onclick="likePost(${post.id})">
                        ❤️ ${post.likes}
                    </button>
                    <button class="action-btn ${userVote === 'dislike' ? 'disliked' : ''}" onclick="dislikePost(${post.id})">
                        👎 ${post.dislikes}
                    </button>
                    <button class="action-btn" onclick="sharePost(${post.id})">
                        📤 ${post.shares}
                    </button>
                    <span class="action-btn">💬 ${post.replies}</span>
                    <button class="action-btn" onclick="showPostDetailById(${post.id})" style="margin-left: auto;">
                        👁️ View
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Show post detail by ID (for list view)
function showPostDetailById(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        showPostDetail(post);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (autoRotate && sphere) {
        sphere.rotation.y += 0.005;
    }
    
    // Animate post dots
    postDots.forEach((dot, index) => {
        const time = Date.now() * 0.001;
        const scale = 1 + Math.sin(time * 2 + index) * 0.1;
        dot.scale.setScalar(scale);
        
        // Make dots face camera
        dot.lookAt(camera.position);
    });
    
    if (renderer) {
        renderer.render(scene, camera);
    }
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function savePosts() {
    localStorage.setItem('socialSphere_posts', JSON.stringify(posts));
}

function loadPosts() {
    const saved = localStorage.getItem('socialSphere_posts');
    if (saved) {
        posts = JSON.parse(saved);
        // Ensure userVotes and postReplies exist
        posts.forEach(post => {
            if (!post.userVotes) post.userVotes = {};
            if (!post.postReplies) post.postReplies = [];
        });
    }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', init);

// Make functions global for onclick handlers
window.likePost = likePost;
window.dislikePost = dislikePost;
window.sharePost = sharePost;
window.showPostDetailById = showPostDetailById;