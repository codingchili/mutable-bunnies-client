import com.codingchili.instance.model.skills.SkillType

if (skills.learned(source, SkillType.farming)) {
    fail.accept("Already know the farming skill.")
} else {
    skills.learn(source, SkillType.farming)
    success.run()
}