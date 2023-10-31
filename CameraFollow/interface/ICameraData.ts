import { TargetMove } from "../../TagetMove/TargetMove";

export interface ICameraFollow {
    initCamera(data: ICameraData): void;
    onLateUpdate?(): void;
    onUpdate?(): void;
    onDisable(): void;
}

export interface ICameraData {
    /**
     * 相机本体
     */
    camera: Laya.Camera,
    /**
     * 相机跟随目标
     */
    target: TargetMove,
    /**
     * 相机控制区域
     */
    touchArea?: Laya.Sprite;
    /**
    * 地图区域 : 针对2d相机跟随特有的
    */
    mapArea?: Laya.Image | Laya.Sprite;
    /**
     * 相机相对目标偏移
     */
    posOffset?: Laya.Vector3;
    /**
     * 最大俯视角
     */
    upAngle?: number;
    /**
     * 最大仰视角
     */
    downangle?: number
}

export enum CameraType {
    /**
     * 自由视角
     */
    free = "free",
    /**
    * 追尾视角
    */
    tail = "tail",
    /**
     * 固定视角
     */
    fix = "fix"

}

