export enum KeyBoardType{
    /**
     * 键盘控制移动，鼠标控制方向 （4-8个键）
     */
    direction = 8,
    /**
     * 上下控制移动，左右控制方向 （4个键）
     */
    rotation = 4,
}


/**按键控制方向 */
export enum KeyBoardDirection{
    /**
     * 正北
     */
    north = "north",
    /**
     * 正南
     */
    sourth = "sourth",
    /**
     * 正西
     */
    west = "west",
    /**
     * 正东
     */
    east = "east",
    /**
     * 西北
     */
    northWest = "northWest",
    /**
     * 西南
     */
    sourthWest = "sourthWest",
    /**
     * 东北
     */
    northEast = "northEast",
    /**
     * 东南
     */
    sourthEast = "sourthEast",
}