* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, #0f0f23 0%, #1e1e3f 100%);
    color: white;
    overflow: hidden;
    height: 100vh;
}

#app {
    position: relative;
    width: 100vw;
    height: 100vh;
}

/* Header */
.header {
    position: fixed;
    top: 20px;
    left: 20px;
    right: 20px;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 16px 24px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header h1 {
    color: #1a1a1a;
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.status {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #1a1a1a;
    font-weight: 600;
}

.pulse-dot {
    width: 12px;
    height: 12px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
}

/* Canvas */
#canvas-container {
    width: 100%;
    height: 100%;
    position: relative;
}

/* Controls */
.controls {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 12px;
    border-radius: 60px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.view-toggle {
    display: flex;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 50px;
    padding: 6px;
    gap: 6px;
}

.btn {
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 12px 16px;
    border-radius: 50px;
    font-size: 18px;
    transition: all 0.3s ease;
    color: #64748b;
    font-weight: 600;
}

.btn:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.btn.primary {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
}

.btn.primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(79, 70, 229, 0.6);
}

.btn.active {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
}

/* List View */
#list-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    overflow-y: auto;
    padding: 120px 20px 120px;
}

#posts-list {
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.post-card {
    background: white;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    color: #1a1a1a;
    transition: transform 0.3s ease;
}

.post-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.post-content {
    margin-bottom: 16px;
    line-height: 1.6;
    font-size: 1.1rem;
}

.post-meta {
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 20px;
}

.post-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 12px;
    font-size: 0.9rem;
    color: #64748b;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 6px;
}

.action-btn:hover {
    background: #f1f5f9;
    transform: translateY(-1px);
}

.action-btn.liked {
    color: #ef4444;
    background: #fef2f2;
}

.action-btn.disliked {
    color: #3b82f6;
    background: #eff6ff;
}

/* Modals */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(10px);
}

.modal-content {
    background: white;
    border-radius: 24px;
    padding: 32px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    color: #1a1a1a;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
}

#post-content, #reply-content {
    width: 100%;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    padding: 16px;
    font-family: inherit;
    font-size: 16px;
    resize: vertical;
    margin-bottom: 20px;
    transition: border-color 0.3s ease;
}

#post-content:focus, #reply-content:focus {
    outline: none;
    border-color: #4f46e5;
}

.modal-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#char-count {
    font-size: 0.9rem;
    color: #64748b;
}

.reply-section {
    margin: 24px 0;
    padding-top: 24px;
    border-top: 2px solid #e2e8f0;
}

#replies-list {
    max-height: 300px;
    overflow-y: auto;
}

.reply-item {
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    border-left: 4px solid #e2e8f0;
}

.reply-content {
    margin-bottom: 8px;
    line-height: 1.5;
}

.reply-meta {
    font-size: 0.8rem;
    color: #64748b;
}

/* Instructions */
.instructions {
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 900;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 20px;
    border-radius: 30px;
    font-size: 0.9rem;
    pointer-events: none;
    backdrop-filter: blur(10px);
}

/* Notifications */
#notifications {
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 1001;
}

.notification {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    padding: 16px 20px;
    border-radius: 16px;
    margin-bottom: 12px;
    box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);
    animation: slideIn 0.5s ease;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.notification:hover {
    transform: translateX(-5px);
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Utilities */
.hidden {
    display: none !important;
}

/* Mobile */
@media (max-width: 768px) {
    .header {
        top: 16px;
        left: 16px;
        right: 16px;
        padding: 12px 20px;
    }

    .header h1 {
        font-size: 1.5rem;
    }

    .controls {
        bottom: 20px;
        padding: 10px;
    }

    .btn {
        padding: 10px 12px;
        font-size: 16px;
    }

    .btn.primary {
        width: 45px;
        height: 45px;
    }

    .modal-content {
        width: 95%;
        padding: 24px;
        margin: 20px;
    }

    #list-container {
        padding: 100px 16px 100px;
    }

    .instructions {
        bottom: 80px;
        font-size: 0.8rem;
    }
}
