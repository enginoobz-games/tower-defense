import Helpers from "./Helpers";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {
    @property
    damage: number = 2
    speed: number = 1000
    targetPos: cc.Vec2

    init(targetPos: cc.Vec2) {
        this.targetPos = targetPos

        Helpers.moveTo(this.node, targetPos, this.speed).then(() => {
            if (!this.node) return
            this.node.destroy()
        })
    }


}
