document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.lezi_drag-scroll-container');
    const content = document.querySelector('.drag-scroll-content');
    
    if (!slider || !content) {
        console.error("找不到滾動容器或內容區塊。");
        return;
    }

    // --- 初始化和參數設定 ---
    
    // 1. 確保內容複製 (用於無縫循環)
    // 如果 HTML 中沒有，這裡動態複製
    if (content.children.length > 0 && content.children.length % 2 !== 0) {
        const originalContent = content.innerHTML;
        content.innerHTML += originalContent; 
    }
    
    // 2. 輪播參數
    const contentWidth = content.scrollWidth / 2; // 原始內容的總寬度
    const scrollSpeed = 0.5; // 每幀移動的像素數 (自動輪播速度)
    let currentPosition = 0; // 目前的 X 軸位移量 (負值，因為是向左移動)

    let animationFrameId;
    let isMarqueeRunning = true; // 自動輪播是否正在運行

    // --- 核心：自動輪播動畫函數 ---
    function marquee() {
        if (!isMarqueeRunning) return;

        // 1. 計算新的位置
        currentPosition -= scrollSpeed; 

        // 2. 檢查循環邊界：是否滾動超過了原始內容的總寬度
        if (currentPosition <= -contentWidth) {
            // 立即跳回起點 (實現無縫循環)
            currentPosition += contentWidth; // 或直接 currentPosition = 0;
            // 由於內容被複製了一份，這裡只要跳過一個 contentWidth 的距離即可
        }

        // 3. 應用變形
        content.style.transform = `translateX(${currentPosition}px)`;

        // 請求下一幀
        animationFrameId = requestAnimationFrame(marquee);
    }
    
    // 啟動自動輪播
    function startMarquee() {
        if (!isMarqueeRunning) {
            isMarqueeRunning = true;
            marquee();
        }
    }

    // 暫停自動輪播
    function pauseMarquee() {
        isMarqueeRunning = false;
        cancelAnimationFrame(animationFrameId);
    }
    
    // --- 拖曳功能相關變數 ---
    let isDragging = false;
    let startX;         // 滑鼠按下時的 X 座標
    let startPosition;  // 滑鼠按下時，內容的 currentPosition

    // --- 拖曳事件處理 ---
    
    // 1. 滑鼠按下 (MouseDown / TouchStart)
    const handleDown = (e) => {
        // 阻止預設選取行為 (如果需要，但 CSS 應該已處理)
        e.preventDefault(); 
        
        isDragging = true;
        pauseMarquee(); // **拖曳開始時，暫停自動輪播**
        
        // 獲取滑鼠或觸控的起始 X 座標
        startX = e.pageX || e.touches[0].pageX; 
        
        // 記錄拖曳開始時的內容位置
        startPosition = currentPosition; 
        
        // 視覺反饋
        slider.style.cursor = 'grabbing';
    };

    // 2. 滑鼠移動 (MouseMove / TouchMove)
    const handleMove = (e) => {
        if (!isDragging) return;

        const currentX = e.pageX || e.touches[0].pageX;
        const walk = currentX - startX; // 滑鼠移動的距離 (正值=往右拖，負值=往左拖)
        
        // 新的位置 = 舊的位置 + 滑鼠移動距離
        // 因為 transform 是負值向左，所以直接相加即可
        let newPosition = startPosition + walk; 

        // 處理循環邊界 (可選，但讓拖曳更穩定)
        // 當拖曳超過邊界時，重新調整 currentPosition，保持在 [-contentWidth, 0] 範圍內
        if (newPosition > 0) {
            newPosition -= contentWidth;
        } else if (newPosition < -contentWidth) {
            newPosition += contentWidth;
        }

        currentPosition = newPosition;
        content.style.transform = `translateX(${currentPosition}px)`;
    };

    // 3. 滑鼠放開 (MouseUp / TouchEnd)
    const handleUp = () => {
        if (isDragging) {
            isDragging = false;
            slider.style.cursor = 'grab'; // 恢復游標
            startMarquee(); // **拖曳結束後，恢復自動輪播**
        }
    };
    
    // --- 註冊事件監聽器 ---

    // 拖曳開始
    slider.addEventListener('mousedown', handleDown);
    slider.addEventListener('touchstart', handleDown);

    // 拖曳移動 (註冊在 document 上以捕捉拖出容器外的事件)
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove);

    // 拖曳結束
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchend', handleUp);

    // 啟動初始化動畫
    startMarquee();
    
    // 設置初始游標
    slider.style.cursor = 'grab';
  });

