// Improve project names to be more meaningful
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

// Better project names
const projectNames = [
  { en: "Clean Water Initiative", ar: "مبادرة المياه النظيفة" },
  { en: "Education for All", ar: "التعليم للجميع" },
  { en: "Healthcare Access", ar: "الوصول إلى الرعاية الصحية" },
  { en: "Food Security Program", ar: "برنامج الأمن الغذائي" },
  { en: "Community Development", ar: "تطوير المجتمع" },
  { en: "Emergency Relief", ar: "الإغاثة الطارئة" },
  { en: "Women's Empowerment", ar: "تمكين المرأة" },
  { en: "Children's Welfare", ar: "رعاية الأطفال" },
  { en: "Sustainable Agriculture", ar: "الزراعة المستدامة" },
  { en: "Digital Literacy", ar: "محو الأمية الرقمية" },
  { en: "Housing Project", ar: "مشروع الإسكان" },
  { en: "Environmental Conservation", ar: "الحفاظ على البيئة" },
  { en: "Skills Training", ar: "تدريب المهارات" },
  { en: "Mental Health Support", ar: "الدعم النفسي" },
  { en: "Elderly Care", ar: "رعاية كبار السن" },
  { en: "Youth Development", ar: "تنمية الشباب" },
  { en: "Infrastructure Support", ar: "الدعم البنيوي" },
  { en: "Cultural Preservation", ar: "الحفاظ على الثقافة" },
  { en: "Animal Welfare", ar: "رفاهية الحيوان" },
  { en: "Legal Aid Services", ar: "خدمات المساعدة القانونية" },
  { en: "Sports Development", ar: "تطوير الرياضة" },
  { en: "Arts & Culture", ar: "الفنون والثقافة" },
  { en: "Technology Access", ar: "الوصول إلى التكنولوجيا" },
  { en: "Public Health", ar: "الصحة العامة" },
  { en: "Economic Empowerment", ar: "التمكين الاقتصادي" },
  { en: "Disaster Response", ar: "الاستجابة للكوارث" }
];

const descriptions = {
  en: "A dedicated project making a positive impact in communities through sustainable solutions and community engagement.",
  ar: "مشروع مخصص يحدث تأثيرًا إيجابيًا في المجتمعات من خلال الحلول المستدامة والمشاركة المجتمعية."
};

async function improveProjectNames() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log(`📊 Found ${projects.length} projects\n`);
    
    let updatedCount = 0;
    
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const nameSet = projectNames[i % projectNames.length];
      
      console.log(`📝 Project ${project._id}:`);
      console.log(`   Current names: ${project.contents?.map(c => c.name).join(', ') || 'none'}`);
      
      if (project.contents && project.contents.length > 0) {
        // Update contents with better names and descriptions
        const updatedContents = project.contents.map((content, index) => {
          if (content.language_code === 'en') {
            return {
              ...content,
              name: nameSet.en,
              description: `${nameSet.en} - Making a difference in communities worldwide.`,
              content: `Our ${nameSet.en.toLowerCase()} project focuses on creating sustainable solutions that empower communities and improve quality of life. Through dedicated efforts and community partnerships, we're working towards lasting positive change.`
            };
          } else if (content.language_code === 'ar') {
            return {
              ...content,
              name: nameSet.ar,
              description: `${nameSet.ar} - إحداث فرق في المجتمعات حول العالم.`,
              content: `مشروع ${nameSet.ar} يركز على خلق حلول مستدامة تمكن المجتمعات وتحسن جودة الحياة. من خلال الجهود المكرسة والشراكات المجتمعية، نعمل نحو تحقيق تغيير إيجابي دائم.`
            };
          }
          return content;
        });
        
        // Update the project
        await Project.updateOne(
          { _id: project._id },
          { $set: { contents: updatedContents } }
        );
        
        console.log(`   ✅ Updated to: ${nameSet.en} / ${nameSet.ar}`);
        updatedCount++;
      } else {
        console.log('   ❌ No contents to update');
      }
      console.log('');
    }
    
    console.log(`🎉 Updated ${updatedCount} projects with better names and descriptions`);
    console.log('\n💡 Your projects now have meaningful names and descriptions!');
    console.log('🔄 Refresh your browser to see the improved project listings');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('📝 Improving Project Names and Descriptions\n');
console.log('This script will update projects with meaningful names and better descriptions.\n');

improveProjectNames();
