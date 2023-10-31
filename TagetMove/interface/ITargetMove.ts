export interface ITargetMove{
    /**
    * 开始移动
    */
    onBegin(): void;
    /**
     * 正在移动
     * @param curDis 当前速度
     * @param curAngle 当前角度
     * @param offsetAngle 偏移角度
     * 
     */
    onMove(curDis: number, curAngle: number,offsetAngle?:number): void;
    /**
     * 每帧跟新
     */
    onUpdate(): void;
    /**
     * 移动结束
     */
    onEnd(): void;

}