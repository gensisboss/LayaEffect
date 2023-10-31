import { TargetMove } from "../TagetMove/TargetMove";
import { CameraFollow2D } from "./CameraFollow2D";
import { CameraFollowFix } from "./CameraFollowFix";
import { CameraFollowFree } from "./CameraFollowFree";
import { CameraFollowTail } from "./CameraFollowTail";
import { CameraType, ICameraData, ICameraFollow } from "./interface/ICameraData";

const { regClass, property } = Laya;

@regClass()
export class CameraFollow extends Laya.Component {

    @property({ type: Boolean, tips: "是否是2D目标" })
    public is2D: boolean;
    @property({ type: Laya.Sprite, tips: "控制范围" })
    public touchArea: Laya.Sprite;
    @property({ type: TargetMove, tips: "跟随目标" })
    public target: TargetMove;
    @property({ type: Laya.Image, hidden: "!data.is2D", tips: "地图范围" })
    public mapArea: Laya.Image;
    @property({ type: CameraType, tips: "跟随类型", hidden: "data.is2D", options: { "自由视角": CameraType.free, "追尾视角": CameraType.tail, "固定视角": CameraType.fix } })
    public cameraType: CameraType = CameraType.free;
    @property({ type: Laya.Vector3, tips: "跟随位置偏移" })
    public offsetPos: Laya.Vector3 = new Laya.Vector3(0, 3, 5);
    @property({ type: Number, hidden: "data.is2D", tips: "最大俯视角" })
    public upAngle: number = 90;
    @property({ type: Number, hidden: "data.is2D", tips: "最大仰视角" })
    public downangle: number = 90;

    private _cameraLogic: ICameraFollow;

    onAwake(): void {
        if (this.is2D) {
            this._cameraLogic = new CameraFollow2D();
        } else {
            switch (this.cameraType) {
                case CameraType.free:
                    this._cameraLogic = new CameraFollowFree();
                    break;
                case CameraType.tail:
                    this._cameraLogic = new CameraFollowTail();
                    break;
                case CameraType.fix:
                    this._cameraLogic = new CameraFollowFix();
                    break;
                default:
                    this._cameraLogic = new CameraFollowFree();
                    break;
            }
        }
        this.initCamera();
    }

    onEnable(): void {
        Laya.stage.on(Laya.Event.MOUSE_WHEEL, this, this.wheelHeadHandler);
    }

    wheelHeadHandler(e: any) {
        if(this.is2D){
            let stepPower = 100;
            let maxScale = 5;
            let minScale = 1;
            let scale = parseFloat((e.delta/stepPower + this.mapArea.scaleX).toFixed(2));
            if (scale > maxScale || scale < minScale) return;
            let lastWidth = this.mapArea.displayWidth;
            let lastHeight = this.mapArea.displayHeight;
            this.mapArea.scaleX = this.mapArea.scaleY = scale;
            let curWidth = this.mapArea.displayWidth;
            let curHeight = this.mapArea.displayHeight;
            this.mapArea.x += (lastWidth - curWidth) / 2;
            this.mapArea.y += (lastHeight - curHeight) / 2;
        }else{
            let maxDis = 100;
            let minDis = 5;
            let camera = (this.owner as Laya.Camera);
            let offset = camera.transform.localPosition.clone();
            Laya.Vector3.subtract(Laya.Vector3.ZERO,offset,offset);
            Laya.Vector3.normalize(offset,offset);
            Laya.Vector3.scale(offset,e.delta,offset);
            let targetPos = camera.transform.localPosition.clone();
            Laya.Vector3.add(targetPos,offset,targetPos)
            let dis =Laya.Vector3.scalarLength(targetPos)
            if(dis < minDis || dis > maxDis){
                return;
            }
            camera.transform.localPosition = targetPos;
        }
       
    }

    initCamera() {
        let cameraData: ICameraData = {
            camera: this.owner as Laya.Camera,
            target: this.target,
            touchArea: this.touchArea,
            mapArea: this.mapArea,
            posOffset: this.offsetPos,
            upAngle: this.upAngle,
            downangle: this.downangle
        }
        this._cameraLogic.initCamera(cameraData);
    }

    onUpdate(): void {
        this._cameraLogic?.onUpdate && this._cameraLogic.onUpdate();
    }


    onLateUpdate(): void {
        this._cameraLogic?.onLateUpdate && this._cameraLogic.onLateUpdate();
    }

    onDisable(): void {
        this._cameraLogic && this._cameraLogic.onDisable();
        Laya.stage.off(Laya.Event.MOUSE_WHEEL, this, this.wheelHeadHandler);
    }

}

