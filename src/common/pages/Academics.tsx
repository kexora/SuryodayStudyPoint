import React, { useState } from 'react';
import { SectionHeading } from '@/common/components/ui/SectionHeading';
import { Card, CardHeader, CardTitle, CardContent } from '@/common/components/ui/Card';
import { BookOpen, Monitor, Dna, FileText, CheckCircle2, Clock, Award, Video, Building2, HelpCircle } from 'lucide-react';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { SEO } from '@/common/components/ui/SEO';
import { Button } from '@/common/components/ui/Button';
import { Link } from 'react-router-dom';
import { schoolConfig } from '@/config/schoolConfig';
import { useLanguage } from '@/context/LanguageContext';

export function Academics() {
  const { t, language } = useLanguage();
  const [selectedMode, setSelectedMode] = useState<'all' | 'online' | 'offline'>('all');

  const courses = [
    {
      id: 'academics-6-12',
      title: 'School Academic Batches (Class 6th to 12th)',
      target: 'CBSE & UP State Board Exams • Evening Batches Available',
      modes: ['Online', 'Offline'],
      subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Social Science', 'Hindi'],
      highlights: [
        'Convenient Evening Batches for school-going students',
        'In-depth NCERT coverage & board exam answer writing skills',
        'Daily Practice Papers (DPPs) & weekly unit tests',
        'Special doubt clearing sessions after regular classes'
      ]
    },
    {
      id: 'computer-courses',
      title: 'Suryoday Computer Classes (CCC / ADCA / DCA / Tally)',
      target: 'Government Certified Computer Literacy & Vocational Skills',
      modes: ['Online', 'Offline'],
      subjects: ['CCC (NIELIT Prep)', 'ADCA (1 Year Diploma)', 'DCA (6 Months)', 'Tally Prime with GST', 'Basic Computer & Typing'],
      highlights: [
        'Hands-on computer lab practicals with 1-on-1 PC allocation',
        'Official NIELIT CCC exam practice sets & test portal',
        'Tally accounting with GST billing & inventory management',
        'Course completion certificate & career assistance'
      ]
    },
    {
      id: 'competition-classes',
      title: 'Suryoday Competition Classes (General Competition)',
      target: 'SSC, UP Police, Army, Railway, UP TGT/PGT & State Exams',
      modes: ['Online', 'Offline'],
      subjects: ['Mathematics (Quant & Speed Math)', 'Reasoning', 'General Knowledge & Current Affairs', 'General Hindi & English'],
      highlights: [
        'Daily speed test series and time management tricks',
        'Chapter-wise previous year question (PYQ) bank solutions',
        'Special batches for UP Police Constable & SI, SSC GD/MTS',
        'Updated monthly current affairs magazine & notes'
      ]
    },
    {
      id: 'jee-neet',
      title: 'Target JEE & NEET Foundation Batch',
      target: 'Engineering & Medical Entrance Preparation',
      modes: ['Online', 'Offline'],
      subjects: ['Physics', 'Chemistry', 'Mathematics (JEE)', 'Biology (NEET)'],
      highlights: [
        'Rigorous problem-solving approach & numerical practice',
        'All India Mock Test Series (AITS) with rank analysis',
        '1-on-1 personal mentorship and score tracking',
        'Recorded video solution library for all DPPs'
      ]
    }
  ];

  const filteredCourses = courses.filter(course => {
    if (selectedMode === 'all') return true;
    if (selectedMode === 'online') return course.modes.includes('Online');
    if (selectedMode === 'offline') return course.modes.includes('Offline');
    return true;
  });

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <SEO 
        title="Courses & Academic Programs | Suryoday Study Point"
        description="Explore Suryoday Study Point online live classes & offline classroom coaching courses for Class 6th to 12th, JEE, NEET and Foundation batches."
      />

      {/* Header Banner */}
      <ScrollReveal direction="up">
        <div className="bg-crhs-navy text-white p-8 md:p-12 rounded-2xl shadow-xl mb-12 relative overflow-hidden border-t-4 border-amber-500">
          <div className="max-w-3xl relative z-10">
            <span className="text-amber-400 font-black text-xs uppercase tracking-widest block mb-2">{t('academics.sub', 'Academic Programs & Batches')}</span>
            <h1 className="text-3xl md:text-5xl font-black uppercase mb-4 leading-tight">
              {t('academics.title', 'Suryoday Study Point Courses')}
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              {t('academics.desc')}
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 font-black text-9xl select-none">SSP</div>
        </div>
      </ScrollReveal>

      {/* Mode Switcher Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md mb-10 gap-4">
        <div>
          <h2 className="text-lg font-black text-crhs-navy uppercase">{t('academics.mode_title', 'Select Mode of Study')}</h2>
          <p className="text-xs text-slate-500 font-medium">{t('academics.mode_desc')}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedMode('all')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${selectedMode === 'all' ? 'bg-crhs-navy text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {t('academics.all_batches', 'All Batches')}
          </button>
          <button
            onClick={() => setSelectedMode('online')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${selectedMode === 'online' ? 'bg-amber-500 text-crhs-navy shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {t('academics.online_batches', '💻 Online Batches')}
          </button>
          <button
            onClick={() => setSelectedMode('offline')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${selectedMode === 'offline' ? 'bg-amber-500 text-crhs-navy shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {t('academics.offline_batches', '🏫 Offline Batches')}
          </button>
        </div>
      </div>

      {/* Course Cards List */}
      <div className="space-y-8 mb-16">
        {filteredCourses.map((course, idx) => (
          <ScrollReveal direction="up" delay={idx * 0.1} key={course.id}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white">
              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Left side info */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {course.modes.map(mode => (
                      <span 
                        key={mode} 
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${mode === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}
                      >
                        {mode === 'Online' ? '💻 Online Live Stream' : '🏫 Offline Campus Batch'}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-2xl font-black text-crhs-navy">{course.title}</h3>
                  <p className="text-amber-600 text-xs font-bold uppercase tracking-wide">{course.target}</p>

                  <div className="pt-2">
                    <p className="text-xs font-extrabold uppercase text-slate-400 mb-2">Subjects Covered:</p>
                    <div className="flex flex-wrap gap-2">
                      {course.subjects.map(sub => (
                        <span key={sub} className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded border border-slate-200">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs font-extrabold uppercase text-slate-400 mb-2">Key Highlights:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {course.highlights.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right side CTA */}
                <div className="lg:col-span-4 bg-slate-50 p-6 rounded-xl border border-slate-200 text-center flex flex-col justify-between h-full">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Batch Admissions Open</p>
                    <p className="text-lg font-black text-crhs-navy mb-4">Academic Session 2026-27</p>
                    <div className="space-y-2 text-xs text-slate-600 font-medium mb-6">
                      <p className="flex items-center justify-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Morning & Evening Batches</p>
                      <p className="flex items-center justify-center gap-2"><Award className="w-4 h-4 text-amber-500" /> Free Demo Class Available</p>
                    </div>
                  </div>

                  <Link to="/admissions" className="w-full">
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-crhs-navy font-black py-3">
                      Apply Online for Batch
                    </Button>
                  </Link>
                </div>

              </div>
            </Card>
          </ScrollReveal>
        ))}
      </div>

      {/* Online vs Offline Advantage Grid */}
      <section className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-200 mb-12">
        <h2 className="text-2xl font-black text-crhs-navy uppercase text-center mb-8">
          Compare Online & Offline Modes at Suryoday Study Point
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 text-white rounded-lg">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-crhs-navy">Online Live Learning</h3>
                <p className="text-xs text-blue-700 font-bold">Study from the comfort of your home</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs font-medium text-slate-700">
              <li className="flex items-center gap-2">✓ HD Live interactive streaming classes</li>
              <li className="flex items-center gap-2">✓ Unlimited recorded lectures replay access</li>
              <li className="flex items-center gap-2">✓ Digital PDFs of DPPs and teacher notes</li>
              <li className="flex items-center gap-2">✓ Online CBT mock test portal with instant ranking</li>
              <li className="flex items-center gap-2">✓ Online live chat doubt solving during class</li>
            </ul>
          </div>

          <div className="p-6 bg-amber-50/50 rounded-xl border border-amber-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-600 text-white rounded-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-crhs-navy">Offline Classroom Learning</h3>
                <p className="text-xs text-amber-700 font-bold">Physical classroom experience at Siwan campus</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs font-medium text-slate-700">
              <li className="flex items-center gap-2">✓ Face-to-face interaction with top faculty</li>
              <li className="flex items-center gap-2">✓ AC Smart classrooms & quiet library hall</li>
              <li className="flex items-center gap-2">✓ Hardcopy printed booklets, books & test papers</li>
              <li className="flex items-center gap-2">✓ Weekly OMR tests & offline doubt desks</li>
              <li className="flex items-center gap-2">✓ High discipline, peer study group environment</li>
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
}
