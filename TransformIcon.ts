/**
* @brief: 游戏图片拖动放大逻辑
* @ author: gongganghao
* @ data: 2023-10-30 14:21
*/
const { regClass, property } = Laya;
@regClass()
export default class TransformIcon extends Laya.Script {

   
   
    //最小范围就是1不允许修改
    public minScale: number = 1;
    @property({ type: Number, tips: "最大缩放范围" })
    public maxScale: number = 5;
    @property({ type: Number, tips: "托动速度" })
    public dragSpeed: number = 2;
    @property({ type: Number, min: 0, max: 0.5, tips: "弹性缩放范围" })
    public flexScale: number = 0.2;
    @property({ type: Number, tips: "弹性位置范围" })
    public flexPosition: number = 100;



    private _scaleStep: number = 0.005;
    private _positionStep: number = 5;
    private _minX: number = 0;
    private _maxX: number = 0;
    private _minY: number = 0;
    private _maxY: number = 0;


    
    private _owner: Laya.Image;
     /** 是否锁定位置 */
    private _isLockPos:boolean = false;
    /** 临时数值 */
    private _tempValue: number = 0;
    /** 缩放前的中心点坐标信息 */
    private _lastPivot: Laya.Point = new Laya.Point();
   

    onEnable(): void {
        this._owner = this.owner as Laya.Image;
        this._owner.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        this._owner.on(Laya.Event.MOUSE_WHEEL, this, this.onMouseWheel);
        this._owner.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        this._owner.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);

    }

    /** 帧听滚轮事件，并处理滚动 */
    onMouseWheel(e: any): void {
        let scale = e.delta * this._scaleStep * 10 + this._owner.scaleX;
        this.setScale(scale);
    }

    onStart(): void {
        //onStart 生命周期里得到的适配宽高比较准确
    }

    /** 更新边界限制 */
    updateLimit(): void {
        //父节点，panel
        let parentBox = this._owner.parent as Laya.Box;
        //设置初始值
        this._minX = parentBox.width - this._owner.displayWidth;
        this._minY = parentBox.height - this._owner.displayHeight;
    }


    onMouseDown(e: Laya.Event): void {
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        if (e.touches && e.touches.length > 1) {
            this._lastPivot = this.getPivot(e);
            this._tempValue = this.getDistance(e);
        } else {
            this._lastPivot.x = this._owner.mouseX;
            this._lastPivot.y = this._owner.mouseY;
        }
        this._isLockPos = false;
    }

    /** 鼠标（或手势）在对象上移动时触发的事件侦听方法 */
    onMouseMove(e: Laya.Event): void {
        if (e.touches && e.touches.length > 1) {
            /**当前的双指距离*/
            let distance = this.getDistance(e);
            //设置缩放
            let scale = this._owner.scaleX + (distance - this._tempValue) * this._scaleStep;
            this.setScale(scale);
            this._tempValue = distance;
            let curPiovt =  this.getPivot(e);
            this.setPositin(new Laya.Vector2(curPiovt.x-this._lastPivot.x,curPiovt.y-this._lastPivot.y))
        }else{
            this.setPositin(new Laya.Vector2(this._owner.mouseX-this._lastPivot.x,this._owner.mouseY-this._lastPivot.y))
        }

    }

    onMouseUp(e: Laya.Event): void {
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        this.flexEffect()
    }


    //回弹效果
    flexEffect(){
        if (this._owner.scaleX < this.minScale || this._owner.scaleX  > this.maxScale) {
            this._isLockPos = true;
            let targetScale = (this._owner.scaleX <= this.minScale) ? this.minScale : this.maxScale; 
            let offsetX = this._owner.x - this._lastPivot.x * (targetScale - this._owner.scaleX);
            let offsetY = this._owner.y - this._lastPivot.y * (targetScale - this._owner.scaleX);
            let targetPos = (this._owner.scaleX <= this.minScale) ? new Laya.Vector2(0,0) : new Laya.Vector2(offsetX,offsetY); 
            Laya.Tween.to(this._owner, {scaleX: targetScale,scaleY: targetScale,x:targetPos.x,y:targetPos.y}, 200,Laya.Ease.circOut,Laya.Handler.create(this,()=>{
                this._isLockPos = false;
                this.updateLimit();
            }))
        }
        if (this._owner.x < this._minX || this._owner.x > this._maxX || this._owner.y < this._minY || this._owner.y > this._maxY) {
            this._isLockPos = true;
            let targetX = this._owner.x;
            if(this._owner.x < this._minX || this._owner.x > this._maxX){
                targetX = (this._owner.x <= this._minX) ? this._minX : this._maxX;
            }
            let targetY = this._owner.y;
            if(this._owner.y < this._minY || this._owner.y > this._maxY){
                targetY = (this._owner.y <= this._minY) ? this._minY : this._maxY;
            }
            Laya.Tween.to(this._owner, { x: targetX, y: targetY}, 200,Laya.Ease.circOut,Laya.Handler.create(this,()=>{
                this._isLockPos = false;
            }))
        };
    }

    /** 计算两个触摸点坐标之间的距离 */
    getDistance(e: Laya.Event): number {
        //初始值为0
        var distance: number = 0;
        if (e.touches && e.touches.length > 1) {
            //计算距离
            let dx: number = e.touches[0].pos.x - e.touches[1].pos.x;
            let dy: number = e.touches[0].pos.y - e.touches[1].pos.y;
            distance = Math.sqrt(dx * dx + dy * dy);
        }
        return distance * 2;
    }

    
    private setPositin(direction:Laya.Vector2) {
        if(Laya.Vector2.scalarLength(direction) >= this._positionStep){
            let offsetX = this._owner.x + direction.x*this.dragSpeed;
            let offsetY = this._owner.y + direction.y*this.dragSpeed;
            this.detectPosition(offsetX,offsetY);
        }
       
    }

    private detectPosition(offsetX:number,offsetY:number){
        if(this._isLockPos){
            return;
        }

        
        if (offsetX < this._minX-this.flexPosition) {
            this._owner.x = this._minX-this.flexPosition;
        }
        else if (offsetX > this._maxX+this.flexPosition) {
            this._owner.x = this._maxX+this.flexPosition;
        }
        else {
            this._owner.x = offsetX;
        }

        if (offsetY < this._minY-this.flexPosition) {
            this._owner.y = this._minY-this.flexPosition;
        }
        else if (offsetY > this._maxY+this.flexPosition) {
            this._owner.y = this._maxY+this.flexPosition;
        }
        else {
            this._owner.y = offsetY;
        }  
    }


    private setScale(value: number) {
        if (value > (this.maxScale*(this.flexScale+1)) || value < (this.minScale *(1-this.flexScale))) {
            return;
        };
        let lastScale = this._owner.scaleX;
        this._owner.scale(value, value);
        if(value >= this.minScale){
            this.updateLimit();
        }else{
            return;
        }
        let offsetX = this._owner.x - this._lastPivot.x * (value - lastScale);
        let offsetY = this._owner.y - this._lastPivot.y * (value - lastScale);
        this.detectPosition(offsetX,offsetY);
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