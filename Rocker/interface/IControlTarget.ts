export interface IControlTarget{
     /**
     * 开始移动
     */
     onBegin(): void;
     /**
      * 正在移动
      * @param curDis 当前速度
      * @param curAngle 当前角度
      */
     onMove(curDis: number, curAngle: number): void;
     /**
      * 移动结束
      */
     onEnd(): void;

}