import Signal from "@rbxts/rbx-better-signal";

export default abstract class Damageable {
    public readonly OnChangeHealth = new Signal<(health: number, maxHealth: number) => void>();
    public readonly OnDamage = new Signal<(damage: number) => void>();
    public readonly OnDied = new Signal<() => void>();

    private maxHealth: number;
    private health: number;

    constructor(health: number) {
        this.health = health;
        this.maxHealth = health;
    }

    public GetHealth() { return this.health; }
    public GetMaxHealth() { return this.maxHealth; }

    public SetHealth(health: number) {
        health = math.max(health, 0);
        health = math.min(health, this.maxHealth);
        
        this.OnChangeHealth.Fire(health, this.maxHealth);

        if (health <= 0) {
            this.Die();
        }

        this.health = health;
    }

    public TakeDamage(damage: number) {
        if (this.health <= 0) { return; }
        
        this.health -= damage;
        this.OnChangeHealth.Fire(math.max(this.health, 0), this.maxHealth);
        this.OnDamage.Fire(this.health < 0 ? damage - math.abs(this.health) : damage);
        this.health = math.max(this.health, 0);

        if (this.health <= 0) {
            this.Die();
        }

        return this.health;
    }

    protected abstract Die(): void;
}