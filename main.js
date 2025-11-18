document.addEventListener('DOMContentLoaded', () => {
    // 選擇作為滾動容器的元素
    const slider = document.querySelector('.lezi_drag-scroll-container');
    
    // 如果找不到元素，則停止執行
    if (!slider) {
        console.error("找不到滾動容器 '.lezi_drag-scroll-container'");
        return;
    }

    let isDown = false; // 追蹤滑鼠是否被按下
    let startX;         // 滑鼠按下時的起始 X 座標
    let scrollLeft;     // 滑鼠按下時，容器的起始滾動位置

    // ===================================
    // 1. 滑鼠按下事件 (mousedown)
    // ===================================
    slider.addEventListener('mousedown', (e) => {
        
        isDown = true;
        // 可選：為容器添加 CSS class 來改變游標樣式，例如變為 'grabbing'
        // slider.classList.add('is-dragging'); 

        // e.pageX 是滑鼠相對於整個文件左側的 X 座標
        // slider.offsetLeft 是容器相對於其 offset 父元素的左側距離
        // 兩者相減得到滑鼠相對於容器左側邊緣的 X 座標
        startX = e.pageX - slider.offsetLeft; 
        
        // 記錄當前的滾動位置
        scrollLeft = slider.scrollLeft;
    });

    // ===================================
    // 2. 滑鼠停止事件 (mouseup & mouseleave)
    // ===================================

    // 滑鼠放開時，停止拖曳
    // 注意：這個事件要註冊在 document 上，這樣即使滑鼠拖曳到容器外放開，也能停止
    document.addEventListener('mouseup', () => {
        isDown = false;
        // slider.classList.remove('is-dragging');
    });

    // 滑鼠離開容器時，停止拖曳
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        // slider.classList.remove('is-dragging');
    });


    // ===================================
    // 3. 滑鼠移動事件 (mousemove)
    // ===================================

    // 注意：這個事件也要註冊在 document 上，這樣即使滑鼠拖曳到容器外移動，仍能維持滾動
    document.addEventListener('mousemove', (e) => {
        if (!isDown) return; // 如果滑鼠沒有按下，就跳過
        
        // 阻止預設行為，如選擇文字或拖曳圖片
        e.preventDefault(); 
        
        // a. 計算當前滑鼠相對於容器左側的 X 座標
        const currentX = e.pageX - slider.offsetLeft;

        // b. 計算滑鼠移動的距離 (Walk)
        // 距離 = (當前 X - 起始 X)
        // 拖曳方向與滾動方向相反，所以這個差值就是滾動要移動的距離
        const walk = currentX - startX; 
        
        // c. 更新容器的滾動位置 (scrollLeft)
        // 新滾動位置 = 舊滾動位置 - 移動距離
        // 因為往右拖曳 (walk > 0) 內容要往左移 (scrollLeft 減少)，所以用減法
        slider.scrollLeft = scrollLeft - walk;

        // 提示：如果您希望滑動更靈敏，可以將公式改為：
        // slider.scrollLeft = scrollLeft - (walk * 1.5); 
    });
    
    
    // ===================================
    // 4. 觸控支援 (可選，但強烈建議)
    // ===================================
    // 為了在手機/平板上也能用手指拖曳，我們也需要加入觸控事件：
    
    slider.addEventListener('touchstart', (e) => {
        isDown = true;
        // 使用 e.touches[0].pageX 處理觸控的 X 座標
        startX = e.touches[0].pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('touchend', () => {
        isDown = false;
    });

    slider.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        // 阻止預設的垂直滾動行為，使水平拖曳更流暢
        e.preventDefault(); 
        
        const currentX = e.touches[0].pageX - slider.offsetLeft;
        const walk = currentX - startX;
        
        slider.scrollLeft = scrollLeft - walk;
    });
});