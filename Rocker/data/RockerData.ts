//摇杆类型
export enum RockerType{
    /**
     * 自由摇杆
     */
    free = "free",
    /**
     * 垂直摇杆
     */
    vertical = "verticle",
    /**
     * 水平摇杆
     */
    horizontal = "horizontal",
}

//摇杆位置类型
export enum RockerPos{
    /**
     * 固定
     */
    fixed = "fixed",
    /**
     * 跟随
     */
    follow = "follow",
}


//摇杆显示类型
export enum RockerShow{
    /**
     * 常驻
     */
    stay = "stay",
    /**
     * 按下显示
     */
    down = "down",
    /**
     * 隐藏
     */
    hide = "hide",
}