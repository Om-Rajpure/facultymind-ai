import React from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, CheckSquare, BarChart2, PieChart, Users } from 'lucide-react';
import Section from './ui/Section';

const Roles = () => {
  return (
    <Section 
      id="roles"
      badge="Stakeholders"
      title={<span>Designed for <span className="text-gradient">Every Stakeholder</span></span>}
      subtitle="Specific features designed for teachers and institutional leaders."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 w-full">
        {/* Teacher Role */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="intense-glass p-8 md:p-12 rounded-[2.5rem] border-primary/10 hover:border-primary/30 transition-all duration-500 group flex flex-col md:flex-row gap-8 items-start"
        >
          <div className="bg-primary/20 p-5 rounded-3xl group-hover:rotate-6 transition-transform shrink-0">
            <User className="text-primary" size={40} />
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-black">For Teachers</h3>
              <p className="text-primary text-[10px] font-black tracking-[0.2em] uppercase opacity-80 mt-1">Personal Wellness Tool</p>
            </div>
            <ul className="space-y-5">
              {[
                { icon: <CheckSquare />, text: "Take periodic assessments to track your mental health and stress levels." },
                { icon: <BarChart2 />, text: "Monitor your Burnout Index over time and identify specific contributing factors." },
                { icon: <ShieldCheck />, text: "Receive personalized recommendations and wellness tips based on AI analysis." }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 group/item">
                  <div className="mt-1 bg-primary/10 p-1.5 rounded-lg group-hover/item:scale-110 transition-transform">{React.cloneElement(item.icon, { size: 18, className: "text-primary" })}</div>
                  <p className="text-text-muted text-sm md:text-base leading-relaxed font-medium">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Admin Role */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="intense-glass p-8 md:p-12 rounded-[2.5rem] border-secondary/10 hover:border-secondary/30 transition-all duration-500 group flex flex-col md:flex-row gap-8 items-start"
        >
          <div className="bg-secondary/20 p-5 rounded-3xl group-hover:rotate-6 transition-transform shrink-0">
            <Users className="text-secondary" size={40} />
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-black">For Admins</h3>
              <p className="text-secondary text-[10px] font-black tracking-[0.2em] uppercase opacity-80 mt-1">Institution Analytics</p>
            </div>
            <ul className="space-y-5">
              {[
                { icon: <PieChart />, text: "Monitor faculty wellness at the department level with anonymized macro data." },
                { icon: <Users />, text: "Identify high-burnout departments and take early preventive corporate actions." },
                { icon: <ShieldCheck />, text: "Access detailed institution reports for accreditation and HR policy improvement." }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 group/item">
                  <div className="mt-1 bg-secondary/10 p-1.5 rounded-lg group-hover/item:scale-110 transition-transform">{React.cloneElement(item.icon, { size: 18, className: "text-secondary" })}</div>
                  <p className="text-text-muted text-sm md:text-base leading-relaxed font-medium">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};

export default Roles;
