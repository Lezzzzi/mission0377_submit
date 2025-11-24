document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.lezi_drag-scroll-container');
    const content = document.querySelector('.drag-scroll-content');
    
    if (!slider || !content) {
        console.error("初始化失敗：找不到滾動容器或內容區塊。");
        return;
    }

    // --- 參數初始化與內容複製 ---
    
    // 檢查內容是否已複製 (用於無縫循環)
    const initialCardCount = content.querySelectorAll('.card_submit_text, .card_submit_pic').length;
    if (initialCardCount > 0 && initialCardCount % 2 !== 0) {
        const originalContent = content.innerHTML;
        content.innerHTML += originalContent; // 複製內容
    }
    
    let contentWidth = 0; // 原始內容的總寬度 (將在啟動時計算)
    const scrollSpeed = 0.5; // 自動輪播速度 (每幀移動的像素數)
    let currentPosition = 0; // 目前的 X 軸位移量 (CSS transform)

    let animationFrameId;
    let isMarqueeRunning = true; 
    let isDragging = false;
    
    // 拖曳功能相關變數
    let startX;         
    let startPosition;  

    // --- 寬度計算與啟動邏輯 ---

    /**
     * 計算單份內容的總寬度。
     * @returns {boolean} 寬度是否計算成功 (大於 0)
     */
    function calculateContentWidth() {
        // 使用 offsetWidth 獲取元素的可視寬度
        const totalContentWidth = content.scrollWidth;
        contentWidth = totalContentWidth / 2;
        
        // 使用 scrollWidth 作為備用，雖然 less accurate
        if (contentWidth <= 0) {
             contentWidth = content.scrollWidth / 2;
        }

        return contentWidth > 0;
    }

    /**
     * 啟動自動輪播
     */
    function startMarquee() {
        // *** 修正點：遞迴檢查，直到寬度有效才啟動 ***
        if (!calculateContentWidth()) {
            // 如果寬度仍然無效，等待下一幀，再檢查一次
            requestAnimationFrame(startMarquee); 
            return;
        }
        
        if (!isMarqueeRunning) {
            isMarqueeRunning = true;
        }
        marquee();
    }
    
    /**
     * 暫停自動輪播
     */
    function pauseMarquee() {
        isMarqueeRunning = false;
        cancelAnimationFrame(animationFrameId);
    }
    
    // --- 核心：自動輪播動畫函數 ---
    /**
     * 使用 requestAnimationFrame 實現平滑移動
     */
    function marquee() {
        if (!isMarqueeRunning || isDragging) return;

        currentPosition -= scrollSpeed; 

        // 循環邊界檢查：滾動超過原始內容的末端時，立即跳回起點
        if (currentPosition <= -contentWidth) {
            currentPosition += contentWidth;
        }

        content.style.transform = `translateX(${currentPosition}px)`;
        animationFrameId = requestAnimationFrame(marquee);
    }
    
    // --- 拖曳事件處理函數 (Handle Functions) ---

    // 處理滑鼠按下/觸控開始
    const handleDown = (e) => {
        e.preventDefault(); 
        
        isDragging = true;
        pauseMarquee(); // 拖曳開始時，暫停自動輪播
        
        // 獲取滑鼠或觸控的起始 X 座標
        startX = e.pageX || (e.touches ? e.touches[0].pageX : 0); 
        
        // 記錄拖曳開始時的內容位置
        startPosition = currentPosition; 
        
        // 視覺反饋
        slider.style.cursor = 'grabbing';
    };

    // 處理滑鼠移動/觸控移動
    const handleMove = (e) => {
        if (!isDragging) return;

        const currentX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
        const walk = currentX - startX; // 滑鼠移動的距離
        
        let newPosition = startPosition + walk; 
        
        //console.log(contentWidth,newPosition);

        // 處理循環邊界
        if (contentWidth > 0) {
            if (newPosition > 0) {
                newPosition -= contentWidth;
            } else if (newPosition < -contentWidth) {
                newPosition += contentWidth;
            }
        }
        
        currentPosition = newPosition;
        content.style.transform = `translateX(${currentPosition}px)`;
    };



    // 處理滑鼠放開/觸控結束
    const handleUp = () => {
        if (isDragging) {
            isDragging = false;
            slider.style.cursor = 'grab'; // 恢復游標
            startMarquee(); // 拖曳結束後，恢復自動輪播
        }
    };
    
    // --- 註冊事件監聽器 ---

    // 拖曳開始
    slider.addEventListener('mousedown', handleDown);
    slider.addEventListener('touchstart', handleDown);

    // 拖曳移動 (註冊在 document 上)
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove);

    // 拖曳結束
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchend', handleUp);

    // 設置初始游標
    slider.style.cursor = 'grab';
    
    // --- 最終啟動點：等待所有資源載入完成後啟動 ---
    window.onload = startMarquee;
});

