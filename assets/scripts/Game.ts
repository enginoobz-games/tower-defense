import EnemySpawner from "./EnemySpawner";
import Helpers from "./Helpers";
import LevelMap from "./LevelMap";
import PanelBuild from "./PanelBuild";
import Tower from "./Tower";
import TowerSpawner from "./TowerSpawner";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {
    static instance: Game = null

    @property(cc.AudioClip)
    backgroundMusic: cc.AudioClip = null
    @property(LevelMap)
    levelMap: LevelMap = null
    @property(PanelBuild)
    panelBuild: PanelBuild = null
    @property(TowerSpawner)
    towerSpawner: TowerSpawner = null
    @property(EnemySpawner)
    enemySpawner: EnemySpawner = null
    @property
    health: number = 20
    @property(cc.Label)
    healthLabel: cc.Label = null
    @property
    coint: number = 100
    @property(cc.Label)
    cointLabel: cc.Label = null
    @property(cc.Node)
    speedButton: cc.Node = null
    @property(cc.Node)
    pauseButton: cc.Node = null

    speedScale: number = 1
    isPaused: boolean = false

    constructor() {
        super()
        if (Game.instance) {
            return Game.instance;
        }

        Game.instance = this;
    }

    onLoad() {
        this.init()
        this.setEvents()
        Helpers.enableCollision(false)
        Helpers.playBackgroundMusic(this.backgroundMusic)
    }

    // init all components here instead of onLoad to ensure the availabilities
    init() {
        this.levelMap.init()
        this.panelBuild.init(this.levelMap)
        this.towerSpawner.init(this.levelMap)
        this.enemySpawner.init(this.levelMap)
        this.updateHeathLabel()
        this.updateCoint(0)
    }

    setEvents() {
        this.levelMap.node.on(cc.Node.EventType.TOUCH_END, this.onMapTouch, this)
        this.speedButton.on(cc.Node.EventType.TOUCH_END, this.toggleSpeedUp, this)
        this.pauseButton.on(cc.Node.EventType.TOUCH_END, this.togglePauseState, this)
        // this.panelCreate.node.on(Events.BUILD_TOWER, this.onBuildTower, this)
        // this.node.on(Events.ENEMY_ATTACK, this.onGetAttacked, this)
    }

    // onGetAttacked(event: cc.Event.EventCustom) {
    //     const data: EnemyAttackData = event.getUserData()
    //     this.health -= data.damage
    //     this.updateHeathLabel()

    //     // stop event delivery
    //     event.stopPropagation();
    // }

    toggleSpeedUp() {
        if (this.isPaused) return

        if (this.speedScale === 1) {
            this.speedButton.color = cc.Color.BLACK
            this.speedScale = 2
        } else if (this.speedScale === 2) {
            this.speedButton.color = cc.Color.WHITE
            this.speedScale = 1
        }

        Helpers.setTimeScale(this.speedScale)
    }

    togglePauseState() {
        if (!this.isPaused) {
            this.isPaused = true
            this.scheduleOnce(() => {
                Helpers.setTimeScale(0)
            }, 0.2) // delay to wait for button effect completes
        } else {
            this.isPaused = false
            Helpers.setTimeScale(this.speedScale)
        }
    }

    getAttack(damage: number) {
        this.health -= damage
        this.updateHeathLabel()
    }

    updateHeathLabel() {
        this.healthLabel.string = this.health.toString()
    }

    updateCoint(change: number) {
        this.coint += change
        this.cointLabel.string = this.coint.toString()
    }

    // onBuildTower(data: BuildTowerData) {
    //     this.towerSpawner.createTower(data)
    //     this.panelCreate.hide()
    // }

    buildTower(towerName: string, coord: cc.Vec2) {
        this.towerSpawner.build(towerName, coord)
        this.panelBuild.hide()
    }

    onMapTouch(event: cc.Event.EventTouch) {
        if (this.isPaused) return

        this.panelBuild.hide()

        const touchPos = event.getLocation()
        const touchCoord: cc.Vec2 = this.levelMap.getTileCoordByPos(touchPos.x * 2, touchPos.y * 2)

        const tileId: number = this.levelMap.towersLayer.getTileGIDAt(touchCoord)
        if (tileId) {
            const tower: Tower = this.towerSpawner.findTowerByCoord(touchCoord)
            if (!tower)
                this.panelBuild.show(touchCoord)
        }
    }
}
