import com.codingchili.instance.model.stats.Attribute


creatures = game.creatures().radius(
        target.getVector().copy().setSize(spell.radius)
)

damage = source.stats[Attribute.dexterity] / 2 + (source.stats[Attribute.level] * 1)

creatures.each {
    amplified = it.stats[Attribute.maxhealth] * 0.02 + damage
    spells.damage(source, it)
        .poison(-amplified)
        .vary(10)
        .apply();
}