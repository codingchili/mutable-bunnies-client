import com.codingchili.instance.model.skills.SkillType

if (skills.learned(source, SkillType.mining)) {
    fail.accept("Already know the mining skill.")
} else {
    skills.learn(source, SkillType.mining)
    success.run()
}