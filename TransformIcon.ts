/**
* @brief: 游戏图片拖动放大逻辑
* @ author: gongganghao
* @ data: 2023-10-30 14:21
*/
const { regClass, property } = Laya;
@regClass()
export default class TransformIcon extends Laya.Script {

    @property({ type: Number, tips: "最小缩放范围" })
    public minScale: number = 1;
    @property({ type: Number, tips: "最大缩放范围" })
    public maxScale: number = 5;
    @property({ type: Number, min:0,max:1, tips: "弹性缩放范围" })
    public flexScale: number = 0.2;
    @property({ type: Number, min:0,max:1, tips: "缩放系数" })
    public scaleStep: number = 0.01;




    private _minX: number = -100;
    private _maxX: number = 0;
    private _minY: number = -100;
    private _maxY: number = 0;



    private _owner: Laya.Image;
    /** 临时缩放倍数 */
    private _tempValue: number = 0;
    /** 缩放前的中心点坐标信息 */
    private lastPivot: Laya.Point = new Laya.Point();

    onEnable(): void {
        this._owner = this.owner as Laya.Image;
        this._owner.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        this._owner.on(Laya.Event.MOUSE_WHEEL, this, this.onMouseWheel);
        this._owner.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        this._owner.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);

    }

    /** 帧听滚轮事件，并处理滚动 */
    onMouseWheel(e: any): void {
        let scale = e.delta * this.scaleStep + this._owner.scaleX;
        this.setScale(scale);
    }

    onStart(): void {
        //onStart 生命周期里得到的适配宽高比较准确
        this.updateLimit();
    }

    /** 更新边界限制 */
    updateLimit(): void {
        //父节点，panel
        let _parent = this.owner.parent as Laya.Panel;
        //设置初始值
        this._minX = _parent.width - this._owner.displayWidth;
        this._minY = _parent.height - this._owner.displayHeight;
    }

    //锁定位置
    lockPosition(){
        let _parent = this.owner.parent as Laya.Panel;
        this._owner.x = (_parent.width - this._owner.displayWidth)/2;
        this._owner.y = (_parent.height - this._owner.displayHeight)/2;
    }


    onMouseDown(e: Laya.Event): void {
        if (e.touches && e.touches.length > 1) {
            this.lastPivot = this.getPivot(e);
            this._tempValue = this.getDistance(e);
            this._owner.stopDrag();
        } else {
            this.updateLimit();
            let dragRect = new Laya.Rectangle(this._minX,this._minY,Math.abs(this._minX),Math.abs(this._minY));
            this._owner.startDrag(dragRect);
        }
       
    }

    /** 鼠标（或手势）在对象上移动时触发的事件侦听方法 */
    onMouseMove(e: Laya.Event): void {
        if (e.touches && e.touches.length > 1) {
            /**当前的双指距离*/
            let distance = this.getDistance(e);
            //设置缩放
            let scale = this._owner.scaleX + (distance - this._tempValue) * this.scaleStep;
            this.setScale(scale,distance);
        }

    }

    onMouseUp(e: Laya.Event): void {
        this._owner.stopDrag();
        if (this._owner.scaleX < this.minScale) {
            Laya.Tween.to(this._owner,{scaleX:this.minScale,scaleY:this.minScale,update:new Laya.Handler(this,()=>{this.setScale(this._owner.scaleX)})},200,Laya.Ease.circOut,Laya.Handler.create(this,()=>{
                this.setScale(this.minScale);
            }),)
        };
    }

    /** 计算两个触摸点坐标之间的距离 */
    getDistance(e: Laya.Event): number {
        //初始值为0
        var distance: number = 0;
        if (e.touches && e.touches.length > 1) {
            //计算距离
            let dx: number = e.touches[0].pos.x -  e.touches[1].pos.x;
            let dy: number = e.touches[0].pos.y -  e.touches[1].pos.y;
            distance = Math.sqrt(dx * dx + dy * dy);
        }
        return distance*2;
    }



    private setScale(value: number,distance?:number) {
        if (value > this.maxScale+this.flexScale || value < this.minScale-this.flexScale) {
            return;
        };
        let lastScale = this._owner.scaleX;
        this._owner.scale(value, value, true);
        if(value <= 1){
           this.lockPosition();
           return;
        }
        this.updateLimit();
        this._tempValue = distance;
        let offsetX  =  this._owner.x - this.lastPivot.x*(value-lastScale);
        let offsetY  =  this._owner.y - this.lastPivot.y*(value-lastScale);

        if (offsetX < this._minX) {
            this._owner.x = this._minX;
        }
        else if (offsetX > this._maxX) {
            this._owner.x = this._maxX;
        }
        else {
            this._owner.x = offsetX;
        }

        if (offsetY < this._minY) {
            this._owner.y = this._minY;
        }
        else if (offsetY > this._maxY) {
            this._owner.y = this._maxY;
        }
        else {
            this._owner.y = offsetY;
        }

    }

    /**
     * 获取多指的中心点坐标
     * @param touches 手势信息数组
     */
    getPivot(e: Laya.Event): Laya.Point {
        let Point0: Laya.Point = this._owner.globalToLocal(new Laya.Point(e.touches[0].pos.x, e.touches[0].pos.y));
        let Point1: Laya.Point = this._owner.globalToLocal(new Laya.Point(e.touches[1].pos.x, e.touches[1].pos.y));
        return new Laya.Point((Point0.x + Point1.x) / 2, (Point0.y + Point1.y) / 2);
    }



    onDisable(): void {
        this.owner.offAll()
    }


}