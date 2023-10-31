import { TargetMove } from "../TagetMove/TargetMove";
import { KeyBoardType } from "./data/KeyBoardData";

const KeyBoard = Laya.Keyboard;
const { regClass, property, classInfo } = Laya;

@regClass()
export class KeyBoardControl extends Laya.Component {

    //#region 键盘配置参数
    @property({ type: KeyBoardType, tips: "键盘类型", options: { "移动控制": KeyBoardType.direction, "方向控制": KeyBoardType.rotation } })
    public keyboardType: KeyBoardType = KeyBoardType.direction;
    @property({ type: [Number], tips: "正北方向键" })
    public northKeys: number[] = [KeyBoard.W, KeyBoard.UP];
    @property({ type: [Number], tips: "正南方向键" })
    public southKeys: number[] = [KeyBoard.S, KeyBoard.DOWN];
    @property({ type: [Number], tips: "正西方向键" })
    public westKeys: number[] = [KeyBoard.A, KeyBoard.LEFT];
    @property({ type: [Number], tips: "正东方向键" })
    public eastKeys: number[] = [KeyBoard.D, KeyBoard.RIGHT];
    @property({ type: [Number], hidden: "data.keyboardType == 4", tips: "东北方向键" })
    public northEastKeys: number[] = [KeyBoard.E];
    @property({ type: [Number], hidden: "data.keyboardType == 4", tips: "西北方向键" })
    public northWestKeys: number[] = [KeyBoard.Q];
    @property({ type: [Number], hidden: "data.keyboardType == 4", tips: "东南方向键" })
    public southEastKeys: number[] = [KeyBoard.C];
    @property({ type: [Number], hidden: "data.keyboardType == 4", tips: "西南方向键" })
    public southWestKeys: number[] = [KeyBoard.Z];

    @property({ type: Number, hidden: "data.keyboardType == 8", tips: "角速度" })
    public angleSpeed: number = 1;
    @property({ type: Number, tips: "线速度" })
    public lineSpeed: number = 1;
    @property({type:TargetMove,tips: "控制对象" })
    public controlTarget: TargetMove;


    //#endregion

    //#region 键盘移动参数
    private _curDownKeyCodes: number[] = []
    //#endregion

    curAngle:number = 0;
    curDis:number = 0;




    //移动控制逻辑
    private directionUpdate() {
        this.curDis = this.lineSpeed;
        for (let i = 0; i < this._curDownKeyCodes.length; i++) {
            const key = this._curDownKeyCodes[i];
            switch (true) {
                case this.northKeys.indexOf(key) >= 0:
                    this.curAngle = -90;
                    break;
                case this.southKeys.indexOf(key) >= 0:
                    this.curAngle = 90;
                    break;
                case this.westKeys.indexOf(key) >= 0:
                    this.curAngle = -180;
                    break;
                case this.eastKeys.indexOf(key) >= 0:
                    this.curAngle = 0;
                    break;
                case this.northEastKeys.indexOf(key) >= 0:
                    this.curAngle = -45;
                    break;
                case this.northWestKeys.indexOf(key) >= 0:
                    this.curAngle = -135;
                    break;
                case this.southEastKeys.indexOf(key) >= 0:
                    this.curAngle = 45;
                    break;
                case this.southWestKeys.indexOf(key) >= 0:
                    this.curAngle = 135;
                    break;
                default:
                    this.curDis = 0;
                    break;
            }
        }

    }

    //方向控制逻辑
    private rotationUpdate() {
        if (this.northKeys.some(num => this._curDownKeyCodes.indexOf(num) >= 0)) {
            this.curDis = this.lineSpeed;
        } else if (this.southKeys.some(num => this._curDownKeyCodes.indexOf(num) >= 0)) {
            this.curDis = -this.lineSpeed;
        } else {
            this.curDis = 0;
        }

        if (this.westKeys.some(num => this._curDownKeyCodes.indexOf(num) >= 0)) {
            this.curAngle -= this.angleSpeed;
        }
        if (this.eastKeys.some(num => this._curDownKeyCodes.indexOf(num) >= 0)) {
            this.curAngle += this.angleSpeed;
        }

    }



    //#region 键盘监听逻辑
    private check(e: Laya.Event) {
        if (e.keyCode != KeyBoard.CONTROL && e.keyCode != KeyBoard.SHIFT) {
            if (e.shiftKey || e.ctrlKey) {
                return false;
            }
        }
        return true;
    }

    onKeyDown(e: Laya.Event): void {
        if (!this.check(e)) {
            return;
        }
        Laya.stage.on(Laya.Event.BLUR,this,this.onBlur)
        this._curDownKeyCodes.indexOf(e.keyCode) < 0 && this._curDownKeyCodes.push(e.keyCode);
        this.controlTarget?.onBegin && this.controlTarget.onBegin();
    }

    onUpdate(): void {
        if (this._curDownKeyCodes.length > 0) {
            switch (this.keyboardType) {
                case KeyBoardType.direction:
                    this.directionUpdate();
                    break;
                case KeyBoardType.rotation:
                    this.rotationUpdate();
                    break;
                default:
                    break;
            }
            this.controlTarget?.onMove && this.controlTarget.onMove(this.curDis, this.curAngle);
        }
    }


    onBlur(): void {
        Laya.stage.off(Laya.Event.BLUR,this,this.onBlur)
        this._curDownKeyCodes = [];
        this.controlTarget?.onEnd && this.controlTarget.onEnd();
    }

    onKeyUp(e: Laya.Event): void {
        if (!e) return;
        if (!this.check(e)) {
            return;
        }
        let i = this._curDownKeyCodes.indexOf(e.keyCode)
        i >= 0 && this._curDownKeyCodes.splice(i, 1);
        if (this._curDownKeyCodes.length <= 0) {
            this.controlTarget?.onEnd && this.controlTarget.onEnd();
        }

    }
    //#endregion



}