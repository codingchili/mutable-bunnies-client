import com.codingchili.instance.model.stats.Attribute


creatures = game.creatures().radius(
        target.getVector().copy().setSize(256)
)

damage = source.stats[Attribute.dexterity] / 2 + (source.stats[Attribute.level] * 1)

creatures.each {
    amplified = it.stats[Attribute.maxhealth] * 0.02 + damage
    spells.damage(source, it)
        .poison(-amplified)
        .apply();
}