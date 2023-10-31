import { TargetMove } from "../TagetMove/TargetMove";
import { RockerPos, RockerShow, RockerType } from "./data/RockerData";



const { regClass, property,classInfo} = Laya;

@regClass()
@classInfo( {
    menu : "TargetControl",
    caption : "RockerControl",
})
export class RockerControl extends Laya.Component {

    //#region 摇杆配置参数
    @property({ type: Laya.Sprite, tips: "摇杆范围" })
    public touchArea: Laya.Sprite;
    @property({ type: Laya.UIComponent, tips: "摇杆背景" })
    public rockerBg: Laya.Image | Laya.Button;
    @property({ type: Laya.UIComponent, tips: "摇杆" })
    public rockerBar: Laya.Image | Laya.Button;

    @property({ type: RockerType, tips: "摇杆类型", options: { "自由摇杆": RockerType.free, "垂直摇杆": RockerType.vertical, "水平摇杆": RockerType.horizontal } })
    public rockerType: RockerType = RockerType.free;
    @property({ type: RockerShow, tips: "摇杆显示", options: { "常驻": RockerShow.stay, "按下显示": RockerShow.down, "隐藏": RockerShow.hide } })
    public rockerShow: RockerShow = RockerShow.stay;
    @property({ type: RockerPos, tips: "摇杆位置", options: { "固定": RockerPos.fixed, "跟随": RockerPos.follow } })
    public rockerPos: RockerPos = RockerPos.fixed;

    @property({ type: Number, tips: "摇杆拖拽距离限制" })
    public dropdis: number = 100;
    @property({ type: Boolean, tips: "摇杆是否锁定" })
    public rockerLock: boolean = false;
    @property({ type: Boolean, tips: "摇杆背景是否跟随旋转" })
    public rockerbgRotate: boolean = false;
    @property({type:TargetMove,tips: "摇杆控制对象" })
    public controlTarget: TargetMove;

    public rockerIsDown: boolean = false; //是否按下
  

    //#endregion

    //#region 摇杆移动参数
    //上一次位置
    private _prespx: number = 0;
    private _prespy: number = 0;
    //按下位置
    private _downspx: number = 0;
    private _downspy: number = 0;
    //当前位置
    private _curspx: number = 0;
    private _curspy: number = 0;
    //初始位置
    private _barinitx: number;
    private _barinity: number;
    private _touchId: number = -1;
    //#endregion

    curAngle:number = 0;
    curDis:number = 0;


    onAwake(): void {
        this.rockerBg.visible = this.rockerShow == RockerShow.stay;
        this.rockerBar.visible = this.rockerShow == RockerShow.stay;
        this.touchArea.on(Laya.Event.MOUSE_DOWN, this, this.onDown);
    }

    /**
    * 设置摇杆界面
    * @param touch 触屏控制区域
    * @param bg 摇杆背景
    * @param bar 摇杆中心
    */
    setRockerView(touch: any, bg: any, bar: any) {
        this.touchArea = touch;
        this.rockerBg = bg;
        this.rockerBar = bar;
    }

  
    /**
     * 更新遥感的选中状态
     * @param selected 
     */
    updateSelectState(selected: boolean) {
        (this.rockerBar as Laya.Button).selected = selected;
        (this.rockerBg as Laya.Button).selected = selected;
    }



    /**鼠标按下 */
    onDown(e: Laya.Event) {
        if (this._touchId != -1 || this.rockerLock) return;
        e.stopPropagation();
        Laya.stage.on(Laya.Event.BLUR, this, this.onUp);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMove);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onUp);
        Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onUp);
        this._touchId = e.touchId;
        this.rockerIsDown = true;
        this._prespx = this._downspx = e.stageX;
        this._prespy = this._downspy = e.stageY;
        this.updateSelectState(true);
        if(this.rockerPos == RockerPos.follow){
            this.rockerBg.x =  this._downspx;
            this.rockerBg.y =  this._downspy;
            this._barinitx =  this._downspx;
            this._barinity = this._downspy;
        }else{
            this._barinitx = this.rockerBar.x;
            this._barinity = this.rockerBar.y;
        }
        this.rockerBg.visible = this.rockerShow != RockerShow.hide;
        this.rockerBar.visible = this.rockerShow != RockerShow.hide;
        this.controlTarget?.onBegin && this.controlTarget.onBegin();
    }

    /**鼠标移动 */
    onMove(e: Laya.Event) {
        if (this.rockerIsDown && e.touchId == this._touchId) {
            this._curspx = e.stageX;
            this._curspy = e.stageY;
            this.computerRoker();
            this.rockerbgRotate && (this.rockerBg.rotation = this.curAngle)
            this.controlTarget?.onMove && this.controlTarget.onMove(this.curDis, this.curAngle);
        }
    }



    /**失去焦点恢复默认状态 */
    onUp() {
        if (!this.rockerBar) return;
        this.rockerBg.visible = this.rockerShow == RockerShow.stay;
        this.rockerBar.visible = this.rockerShow == RockerShow.stay;
        Laya.stage.off(Laya.Event.BLUR, this, this.onUp);
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMove);
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onUp);
        Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onUp);
        this.updateSelectState(false);
        this._touchId = -1;
        this.curDis = 0;
        this.rockerIsDown = false;
        this.rockerBar.x = this._barinitx;
        this.rockerBar.y = this._barinity;
        this.controlTarget?.onEnd && this.controlTarget.onEnd();
    }


    /**计算鼠标位置 */
    private computerRoker(): void {
        if (this._curspx == this._prespx && this._curspy == this._prespy) return;
        this._prespx = this._curspx;
        this._prespy = this._curspy;
        switch (this.rockerType) {
            case RockerType.free:
                this.freeRockerUpdate();
                break;
            case RockerType.vertical:
                this.verticleRockerUpdate();
                break;
            case RockerType.horizontal:
                this.horizontalRockerUpdate();
                break;
            default:
                break;
        }

    }

    /**计算自由鼠标位置 */
    private freeRockerUpdate(): void {
        let value: number = (this._downspx - this._curspx) * (this._downspx - this._curspx) + (this._downspy - this._curspy) * (this._downspy - this._curspy);
        let dis: number = Math.abs(Math.sqrt(value));
        let delatx: number = this._curspx - this._downspx;
        let delaty: number = this._curspy - this._downspy;
        let angle: number = Math.atan2(delaty, delatx) * 180 / Math.PI;

        this.curAngle = angle;
        if (dis < this.dropdis) {
            this.rockerBar.x = this._barinitx + delatx;
            this.rockerBar.y = this._barinity + delaty;
            let pdis: number = Math.abs(Math.sqrt((this._barinitx - this.rockerBar.x) * (this._barinitx - this.rockerBar.x) + (this._barinity - this.rockerBar.y) * (this._barinity - this.rockerBar.y)));
            this.curDis = parseFloat((pdis / this.dropdis).toFixed(2));
        } else {
            let radians: number = Math.PI / 180 * angle;
            let x: number = Math.floor(Math.cos(radians) * this.dropdis + this._barinitx);
            let y: number = Math.floor(Math.sin(radians) * this.dropdis + this._barinity);
            this.rockerBar.x = x;
            this.rockerBar.y = y;
            this.curDis = 1;

        }
    }

    /**计算垂直鼠标位置 */
    private verticleRockerUpdate(): void {
        let dis: number = Math.abs(this._curspy - this._downspy);
        let delatx: number = 0;
        let delaty: number = this._curspy - this._downspy;
        let angle: number = Math.atan2(delaty, delatx) * 180 / Math.PI;
        this.curAngle = angle;
        if (dis < this.dropdis) {
            this.rockerBar.y = this._barinity + delaty;
            this.curDis = parseFloat((Math.abs(delaty) / this.dropdis).toFixed(2));
        } else {
            let radians: number = Math.PI / 180 * angle;
            let y: number = Math.floor(Math.sin(radians) * this.dropdis + this._barinity);
            this.rockerBar.y = y;
            this.curDis = 1;
        }
    }

    /**计算水平鼠标位置 */
    private horizontalRockerUpdate(): void {
        let dis: number = Math.abs(this._curspx - this._downspx);
        let delatx: number = this._curspx - this._downspx;
        let delaty: number = 0;
        let angle: number = Math.atan2(delaty, delatx) * 180 / Math.PI;
        this.curAngle = angle;
        if (dis < this.dropdis) {
            this.rockerBar.x = this._barinitx + delatx;
            this.curDis = parseFloat((Math.abs(delatx) / this.dropdis).toFixed(2));
        } else {
            let radians: number = Math.PI / 180 * angle;
            let x: number = Math.floor(Math.cos(radians) * this.dropdis + this._barinitx);
            this.rockerBar.x = x;
            this.curDis = 1;
        }
    }


}