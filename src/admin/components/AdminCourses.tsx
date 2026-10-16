import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { Input } from '@/common/components/ui/Input';
import { Modal } from '@/common/components/ui/Modal';
import { 
  BookOpen, Plus, Trash2, Edit2, CheckCircle2, XCircle, 
  ExternalLink, Sparkles, AlertCircle, Clock, Award, Layers, 
  RotateCcw, Eye, ToggleLeft, ToggleRight
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CourseItem } from '@/types';
import { Link } from 'react-router-dom';

const STANDARD_INITIAL_COURSES: Omit<CourseItem, 'id'>[] = [
  {
    title: 'School Academic Batches (Class 6th to 12th)',
    target: 'CBSE & UP State Board Exams • Evening Batches Available',
    modes: ['Online', 'Offline'],
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Social Science', 'Hindi'],
    highlights: [
      'Convenient Evening Batches for school-going students',
      'In-depth NCERT coverage & board exam answer writing skills',
      'Daily Practice Papers (DPPs) & weekly unit tests',
      'Special doubt clearing sessions after regular classes'
    ],
    academicSession: 'Academic Session 2026-27',
    batchTiming: 'Evening Batches: 3:30 PM - 7:30 PM',
    isAdmissionOpen: true,
    order: 1
  },
  {
    title: 'Suryoday Computer Classes (CCC / ADCA / DCA / Tally)',
    target: 'Government Certified Computer Literacy & Vocational Skills',
    modes: ['Online', 'Offline'],
    subjects: ['CCC (NIELIT Prep)', 'ADCA (1 Year Diploma)', 'DCA (6 Months)', 'Tally Prime with GST', 'Basic Computer & Typing'],
    highlights: [
      'Hands-on computer lab practicals with 1-on-1 PC allocation',
      'Official NIELIT CCC exam practice sets & test portal',
      'Tally accounting with GST billing & inventory management',
      'Course completion certificate & career assistance'
    ],
    academicSession: 'Academic Session 2026-27',
    batchTiming: 'Flexible Lab Shifts (7:00 AM - 6:00 PM)',
    isAdmissionOpen: true,
    order: 2
  },
  {
    title: 'Suryoday Competition Classes (General Competition)',
    target: 'SSC, UP Police, Army, Railway, UP TGT/PGT & State Exams',
    modes: ['Online', 'Offline'],
    subjects: ['Mathematics (Quant & Speed Math)', 'Reasoning', 'General Knowledge & Current Affairs', 'General Hindi & English'],
    highlights: [
      'Daily speed test series and time management tricks',
      'Chapter-wise previous year question (PYQ) bank solutions',
      'Special batches for UP Police Constable & SI, SSC GD/MTS',
      'Updated monthly current affairs magazine & notes'
    ],
    academicSession: 'Academic Session 2026-27',
    batchTiming: 'Morning & Evening Shift Batches',
    isAdmissionOpen: false,
    order: 3
  },
  {
    title: 'Target JEE & NEET Foundation Batch',
    target: 'Engineering & Medical Entrance Preparation',
    modes: ['Online', 'Offline'],
    subjects: ['Physics', 'Chemistry', 'Mathematics (JEE)', 'Biology (NEET)'],
    highlights: [
      'Rigorous problem-solving approach & numerical practice',
      'All India Mock Test Series (AITS) with rank analysis',
      '1-on-1 personal mentorship and score tracking',
      'Recorded video solution library for all DPPs'
    ],
    academicSession: 'Academic Session 2026-27',
    batchTiming: 'Intensive Weekend & Evening Batches',
    isAdmissionOpen: false,
    order: 4
  }
];

export function AdminCourses() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    target: '',
    modes: ['Online', 'Offline'] as ('Online' | 'Offline')[],
    subjectsInput: '',
    highlightsInput: '',
    academicSession: 'Academic Session 2026-27',
    batchTiming: '',
    isAdmissionOpen: false,
    order: 1
  });

  // Real-time synchronization with Firestore collection 'courses'
  useEffect(() => {
    const coursesRef = collection(db, 'courses');
    const unsubscribe = onSnapshot(
      coursesRef,
      (snapshot) => {
        const list: CourseItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as CourseItem);
        });

        // Sort by order ascending, then by creation date
        list.sort((a, b) => {
          const orderA = a.order ?? 99;
          const orderB = b.order ?? 99;
          if (orderA !== orderB) return orderA - orderB;
          return (b.createdAt || 0) - (a.createdAt || 0);
        });

        setCourses(list);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching courses in real time:', error);
        setMessage({ text: 'Failed to load courses from Firebase.', type: 'error' });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      target: '',
      modes: ['Online', 'Offline'],
      subjectsInput: '',
      highlightsInput: '',
      academicSession: 'Academic Session 2026-27',
      batchTiming: '',
      isAdmissionOpen: false,
      order: courses.length + 1
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (course: CourseItem) => {
    setEditingId(course.id);
    setFormData({
      title: course.title || '',
      target: course.target || '',
      modes: course.modes && course.modes.length > 0 ? course.modes : ['Online', 'Offline'],
      subjectsInput: (course.subjects || []).join(', '),
      highlightsInput: (course.highlights || []).join('\n'),
      academicSession: course.academicSession || 'Academic Session 2026-27',
      batchTiming: course.batchTiming || '',
      isAdmissionOpen: Boolean(course.isAdmissionOpen),
      order: course.order ?? (courses.length + 1)
    });
    setIsModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage({ text: 'Please enter a course title.', type: 'error' });
      return;
    }

    try {
      const subjects = formData.subjectsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const highlights = formData.highlightsInput
        .split('\n')
        .map(h => h.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        target: formData.target.trim(),
        modes: formData.modes,
        subjects,
        highlights,
        academicSession: formData.academicSession.trim(),
        batchTiming: formData.batchTiming.trim(),
        isAdmissionOpen: formData.isAdmissionOpen,
        order: Number(formData.order) || 1,
        updatedAt: Date.now()
      };

      if (editingId) {
        await updateDoc(doc(db, 'courses', editingId), payload);
        setMessage({ text: 'Course updated successfully!', type: 'success' });
      } else {
        await addDoc(collection(db, 'courses'), {
          ...payload,
          createdAt: Date.now()
        });
        setMessage({ text: 'New course added successfully to Firebase!', type: 'success' });
      }

      resetForm();
    } catch (err: any) {
      console.error('Error saving course:', err);
      setMessage({ text: `Failed to save course: ${err.message}`, type: 'error' });
    }
  };

  // Direct 1-click toggle for admission status
  const handleToggleAdmission = async (course: CourseItem) => {
    try {
      const newStatus = !course.isAdmissionOpen;
      await updateDoc(doc(db, 'courses', course.id), {
        isAdmissionOpen: newStatus,
        updatedAt: Date.now()
      });
      setMessage({
        text: `Admission for "${course.title}" is now ${newStatus ? 'OPEN' : 'CLOSED'}.`,
        type: 'success'
      });
    } catch (err: any) {
      console.error('Error toggling admission:', err);
      setMessage({ text: `Failed to update admission status: ${err.message}`, type: 'error' });
    }
  };

  const handleDelete = async (course: CourseItem) => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'courses', course.id));
      setMessage({ text: `Course "${course.title}" deleted.`, type: 'success' });
    } catch (err: any) {
      console.error('Error deleting course:', err);
      setMessage({ text: `Delete failed: ${err.message}`, type: 'error' });
    }
  };

  // Seed default courses if admin wants a quick start
  const handleSeedStandardCourses = async () => {
    if (!window.confirm('Do you want to initialize the 4 standard courses into Firebase?')) return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      for (const courseData of STANDARD_INITIAL_COURSES) {
        const newDocRef = doc(collection(db, 'courses'));
        batch.set(newDocRef, {
          ...courseData,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      await batch.commit();
      setMessage({ text: 'Standard courses successfully added to Firebase!', type: 'success' });
    } catch (err: any) {
      console.error('Error seeding courses:', err);
      setMessage({ text: `Failed to seed courses: ${err.message}`, type: 'error' });
    } finally {
      setIsSeeding(false);
    }
  };

  const openAdmissionsCount = courses.filter(c => c.isAdmissionOpen).length;

  return (
    <div className="space-y-6">
      {/* Alert Notification */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-bold shadow-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs uppercase underline">Dismiss</button>
        </div>
      )}

      {/* Top Banner & Stats */}
      <Card className="border-0 shadow-lg bg-white overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-600 tracking-widest mb-1">
              <Sparkles className="w-4 h-4" /> Real-time Course Management
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-crhs-navy uppercase tracking-tight">
              Academics & Courses
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
              Add and manage academic courses displayed on the website. Control course-specific online admission openings with dynamic apply links.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {courses.length === 0 && (
              <Button 
                onClick={handleSeedStandardCourses} 
                disabled={isSeeding} 
                variant="outline" 
                className="border-amber-400 text-amber-700 hover:bg-amber-50 text-xs font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                {isSeeding ? 'Seeding...' : 'Seed Standard Courses'}
              </Button>
            )}

            <Button 
              onClick={handleOpenCreateModal} 
              className="bg-crhs-navy text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add New Course
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-slate-100 bg-slate-50/70 p-4">
          <div className="px-4 py-2 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Courses</span>
            <span className="text-2xl font-black text-crhs-navy">{courses.length}</span>
          </div>
          <div className="px-4 py-2 text-center">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Admissions Open</span>
            <span className="text-2xl font-black text-emerald-600">{openAdmissionsCount}</span>
          </div>
          <div className="px-4 py-2 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Admissions Closed</span>
            <span className="text-2xl font-black text-slate-600">{courses.length - openAdmissionsCount}</span>
          </div>
        </div>
      </Card>

      {/* Courses List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">
          Connecting to Firebase courses...
        </div>
      ) : courses.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 text-center p-12 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-black uppercase text-crhs-navy">No Courses Found in Firebase</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You haven't created any courses yet. Add your first course or initialize with the standard courses.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button onClick={handleSeedStandardCourses} variant="outline" className="text-xs font-bold">
              Load Standard Courses
            </Button>
            <Button onClick={handleOpenCreateModal} className="text-xs font-bold bg-crhs-navy text-white">
              <Plus className="w-4 h-4 mr-1" /> Create First Course
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className={`border-2 transition-all shadow-sm hover:shadow-md bg-white ${
                course.isAdmissionOpen ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-slate-200'
              }`}
            >
              <div className="p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                
                {/* Course Details */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {course.isAdmissionOpen ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ADMISSION OPEN
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                        🔒 ADMISSION CLOSED
                      </span>
                    )}

                    {course.modes?.map(m => (
                      <span key={m} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        m === 'Online' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {m}
                      </span>
                    ))}

                    {course.academicSession && (
                      <span className="text-[11px] font-bold text-slate-400">
                        • {course.academicSession}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-crhs-navy">
                      {course.title}
                    </h3>
                    <p className="text-xs font-bold text-amber-600 mt-0.5">
                      {course.target}
                    </p>
                  </div>

                  {course.subjects && course.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {course.subjects.map((sub, i) => (
                        <span key={i} className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200">
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}

                  {course.batchTiming && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{course.batchTiming}</span>
                    </p>
                  )}
                </div>

                {/* Admission Control & Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  {/* Direct Toggle Button */}
                  <Button
                    onClick={() => handleToggleAdmission(course)}
                    variant="outline"
                    className={`flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider px-4 py-2.5 h-auto transition-all ${
                      course.isAdmissionOpen 
                        ? 'border-emerald-500 text-emerald-700 bg-emerald-50/60 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-400' 
                        : 'border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                    }`}
                    title={course.isAdmissionOpen ? "Click to stop/close admission for this course" : "Click to open admission for this course"}
                  >
                    {course.isAdmissionOpen ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-emerald-600" />
                        <span>Admission Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-slate-400" />
                        <span>Admission Inactive</span>
                      </>
                    )}
                  </Button>

                  {/* Test Dynamic Link */}
                  {course.isAdmissionOpen && (
                    <a
                      href={`/admissions?courseId=${course.id}&course=${encodeURIComponent(course.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 transition-colors"
                      title="Test dynamic admission apply link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test Link</span>
                    </a>
                  )}

                  {/* Edit & Delete */}
                  <div className="flex items-center gap-2 justify-end">
                    <Button 
                      onClick={() => handleEdit(course)} 
                      variant="outline" 
                      size="sm" 
                      className="border-slate-200 text-slate-700 hover:bg-slate-100"
                      title="Edit Course"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDelete(course)} 
                      variant="outline" 
                      size="sm" 
                      className="border-rose-200 text-rose-600 hover:bg-rose-50"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                </div>

              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Course Create / Edit Modal */}
      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={resetForm} 
          title={editingId ? 'Edit Academic Course' : 'Create New Academic Course'}
        >
          <form onSubmit={handleSaveCourse} className="space-y-5">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Course Title *</label>
              <Input
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. School Academic Batches (Class 6th to 12th)"
                required
              />
            </div>

            {/* Target / Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Target / Curriculum *</label>
              <Input
                value={formData.target}
                onChange={e => setFormData(prev => ({ ...prev, target: e.target.value }))}
                placeholder="e.g. CBSE & UP State Board Exams • Evening Batches Available"
                required
              />
            </div>

            {/* Study Modes & Academic Session */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Offered Modes</label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.modes.includes('Online')}
                      onChange={e => {
                        const newModes = e.target.checked 
                          ? [...formData.modes, 'Online' as const]
                          : formData.modes.filter(m => m !== 'Online');
                        setFormData(prev => ({ ...prev, modes: newModes }));
                      }}
                      className="w-4 h-4 accent-crhs-navy"
                    />
                    <span>💻 Online Live</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.modes.includes('Offline')}
                      onChange={e => {
                        const newModes = e.target.checked 
                          ? [...formData.modes, 'Offline' as const]
                          : formData.modes.filter(m => m !== 'Offline');
                        setFormData(prev => ({ ...prev, modes: newModes }));
                      }}
                      className="w-4 h-4 accent-crhs-navy"
                    />
                    <span>🏫 Offline Campus</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Academic Session</label>
                <Input
                  value={formData.academicSession}
                  onChange={e => setFormData(prev => ({ ...prev, academicSession: e.target.value }))}
                  placeholder="e.g. Academic Session 2026-27"
                />
              </div>
            </div>

            {/* Batch Timing */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Batch Timing / Shifts</label>
              <Input
                value={formData.batchTiming}
                onChange={e => setFormData(prev => ({ ...prev, batchTiming: e.target.value }))}
                placeholder="e.g. Morning: 6:30 AM - 9:30 AM | Evening: 3:30 PM - 7:30 PM"
              />
            </div>

            {/* Subjects list (comma separated) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Subjects Covered (comma-separated)</label>
              <Input
                value={formData.subjectsInput}
                onChange={e => setFormData(prev => ({ ...prev, subjectsInput: e.target.value }))}
                placeholder="Physics, Chemistry, Mathematics, Biology, English"
              />
            </div>

            {/* Highlights (one per line) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Key Highlights (one bullet per line)</label>
              <textarea
                value={formData.highlightsInput}
                onChange={e => setFormData(prev => ({ ...prev, highlightsInput: e.target.value }))}
                placeholder={"Daily Practice Papers (DPPs)\nSpecial doubt clearing sessions\nWeekly OMR/CBT tests"}
                rows={4}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* Prominent Admission Toggle inside Modal */}
            <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50/50 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-crhs-navy">Open Online Admissions for this Course</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  When enabled, this course will show the active "Apply Online" button with a dynamic link.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  checked={formData.isAdmissionOpen}
                  onChange={e => setFormData(prev => ({ ...prev, isAdmissionOpen: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" onClick={resetForm} variant="outline" size="sm">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-crhs-navy text-white hover:bg-slate-800">
                {editingId ? 'Save Changes' : 'Create Course'}
              </Button>
            </div>

          </form>
        </Modal>
      )}
    </div>
  );
}
