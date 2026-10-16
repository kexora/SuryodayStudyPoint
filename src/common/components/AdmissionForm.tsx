import { schoolConfig } from "@/config/schoolConfig";
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/common/components/ui/Button';
import { Input } from '@/common/components/ui/Input';
import { Card, CardContent } from '@/common/components/ui/Card';
import { CustomSelect } from '@/common/components/ui/CustomSelect';
import { CustomDatePicker } from '@/common/components/ui/CustomDatePicker';
import { themeConfig, getRadiusClass } from '@/theme.config';
import { cn } from '@/lib/utils';
import { Check, Clock, X, ChevronRight, ChevronLeft, Info, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { CourseItem } from '@/types';

const STEPS = [
  { id: 1, title: "Student Details", desc: "Personal info & identity" },
  { id: 2, title: "Parent Details", desc: "Guardian & contact info" },
  { id: 3, title: "Academic Record", desc: "Previous school details" },
  { id: 4, title: "Documents", desc: "Upload required files" }
];

interface AdmissionFormProps {
  targetCourse?: CourseItem | null;
  openCourses?: CourseItem[];
}

export function AdmissionForm({ targetCourse, openCourses = [] }: AdmissionFormProps) {
  const { user, userData } = useAuth();
  const formRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [highestStepVisited, setHighestStepVisited] = useState(1);
  const [activeInfo, setActiveInfo] = useState<number | null>(null);
  const totalSteps = STEPS.length;
  
  // Application State
  const [loading, setLoading] = useState(true);
  const [hasExistingApp, setHasExistingApp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [existingAppStatus, setExistingAppStatus] = useState<string>('Pending');
  const [existingAppCrhsId, setExistingAppCrhsId] = useState<string>('');
  
  // Form State
  const [dob, setDob] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [studyMode, setStudyMode] = useState('Offline Classroom');
  const [classApplied, setClassApplied] = useState('');
  const [category, setCategory] = useState('');
  const [busRequired, setBusRequired] = useState('');
  const [previouslyStudied, setPreviouslyStudied] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    bloodGroup: '',
    aadhaarNumber: '',
    fatherName: '',
    fatherQual: '',
    fatherOcc: '',
    fatherPhone: '',
    motherName: '',
    motherQual: '',
    motherOcc: '',
    motherPhone: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    prevSchool: '',
    prevCity: '',
    prevClass: '',
    prevGrade: '',
    tcNumber: '',
    busStop: ''
  });

  useEffect(() => {
    if (userData) {
      const nameParts = (userData.fullName || userData.name || '').trim().split(' ');
      let firstName = '';
      let middleName = '';
      let lastName = '';
      
      if (nameParts.length === 1) {
        firstName = nameParts[0];
      } else if (nameParts.length === 2) {
        firstName = nameParts[0];
        lastName = nameParts[1];
      } else if (nameParts.length > 2) {
        firstName = nameParts[0];
        lastName = nameParts[nameParts.length - 1];
        middleName = nameParts.slice(1, -1).join(' ');
      }

      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || firstName,
        middleName: prev.middleName || middleName,
        lastName: prev.lastName || lastName,
        fatherName: prev.fatherName || userData.fatherName || '',
        motherName: prev.motherName || userData.motherName || '',
        fatherPhone: prev.fatherPhone || userData.mobileNumber || '',
        streetAddress: prev.streetAddress || (userData.villageTown ? `${userData.villageTown}${userData.block ? `, ${userData.block}` : ''}` : ''),
        city: prev.city || userData.district || '',
        state: prev.state || userData.state || '',
        pincode: prev.pincode || userData.pincode || '',
      }));
    }
  }, [userData]);

  useEffect(() => {
    if (targetCourse) {
      setClassApplied(targetCourse.title);
      if (targetCourse.modes && targetCourse.modes.length === 1) {
        setStudyMode(targetCourse.modes[0] === 'Online' ? 'Online Live Class' : 'Offline Classroom');
      }
    } else if (openCourses.length > 0 && !classApplied) {
      setClassApplied(openCourses[0].title);
    }
  }, [targetCourse, openCourses]);

  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        let q;
        if (targetCourse?.id) {
          q = query(
            collection(db, 'applications'),
            where('userId', '==', user.uid),
            where('courseId', '==', targetCourse.id)
          );
        } else {
          q = query(collection(db, 'applications'), where('userId', '==', user.uid));
        }
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const appData = querySnapshot.docs[0].data() as any;
          setHasExistingApp(true);
          setEnrollmentNo(appData.enrollmentNo || '');
          setExistingAppStatus(appData.status || 'Pending');
          setExistingAppCrhsId(appData.crhsId || '');
          setIsSubmitted(true);
        }
      } catch (error) {
        console.error('Error checking existing application:', error);
      } finally {
        setLoading(false);
      }
    };
    checkExistingApplication();
  }, [user, targetCourse]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (formRef.current && !loading && !isSubmitted) {
      const yOffset = -100;
      const y = formRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [step, loading, isSubmitted]);

  const scrollToTop = () => {};

  const nextStep = () => {
    setStep(s => {
      const next = Math.min(s + 1, totalSteps);
      setHighestStepVisited(h => Math.max(h, next));
      scrollToTop();
      return next;
    });
  };
  
  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1));
    scrollToTop();
  };

  const handleStepClick = (id: number) => {
    if (id <= highestStepVisited && !isSubmitted) {
      setStep(id);
    }
  };

  const handleInfoClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setActiveInfo(activeInfo === id ? null : id);
    if (activeInfo !== id) {
      setTimeout(() => setActiveInfo(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      nextStep();
      return;
    }
    
    if (!user) return;

    setIsSubmitting(true);
    try {
      const generatedNo = `${schoolConfig.schoolShortName}-26-${Math.floor(10000 + Math.random() * 90000)}`;
      
      const applicationData = {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        dob: dob ? dob.toISOString() : null,
        gender,
        studyMode,
        classApplied,
        courseId: targetCourse?.id || '',
        category,
        busRequired,
        previouslyStudied,
        enrollmentNo: generatedNo,
        submittedAt: new Date().toISOString(),
        status: 'Pending',
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'applications'), applicationData);
      
      setEnrollmentNo(generatedNo);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full mx-auto border-0 shadow-xl bg-white p-12 text-center">
        <div className="w-8 h-8 border-4 border-crhs-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Checking application status...</p>
      </Card>
    );
  }

  
  if (hasExistingApp || isSubmitted) {
    return (
      <Card className="w-full mx-auto border-0 shadow-xl bg-white overflow-hidden">
        <CardContent className="p-12 text-center flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${existingAppStatus === 'Approved' ? 'bg-emerald-100' : existingAppStatus === 'Rejected' ? 'bg-rose-100' : 'bg-blue-100'}`}>
            {existingAppStatus === 'Approved' ? <Check className="w-12 h-12 text-emerald-600" /> : existingAppStatus === 'Rejected' ? <X className="w-12 h-12 text-rose-600" /> : <Clock className="w-12 h-12 text-blue-600" />}
          </div>
          <h2 className="text-3xl font-black text-crhs-navy uppercase tracking-wider mb-4">
            {existingAppStatus === 'Approved' ? 'Application Approved!' : existingAppStatus === 'Rejected' ? 'Application Rejected' : 'Application Received!'}
          </h2>
          <p className="text-slate-600 font-medium text-lg max-w-lg mb-8 leading-relaxed">
            {existingAppStatus === 'Approved' 
              ? "Congratulations! Your child's admission has been approved." 
              : existingAppStatus === 'Rejected'
              ? "Unfortunately, your application was not approved at this time."
              : hasExistingApp 
              ? "You have already submitted an application. We are currently reviewing your details." 
              : "Your application has been successfully submitted. We will review your details and contact you soon."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mb-8">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex-1">
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2">Application Reference ID</p>
              <p className="text-2xl font-black text-crhs-navy tracking-tight">{enrollmentNo}</p>
            </div>
            {existingAppCrhsId && (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex-1">
                <p className="text-sm text-emerald-700 font-bold uppercase tracking-widest mb-2">Student CRHS ID</p>
                <p className="text-3xl font-black text-emerald-900 tracking-tight">{existingAppCrhsId}</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button variant="outline" size="lg" onClick={() => navigate('/')}>
              Return to Home
            </Button>
            <Button size="lg" className="bg-crhs-navy text-white px-8" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={formRef} className="w-full mx-auto border-0 shadow-xl bg-white">
      <div className="flex flex-col md:flex-row min-h-[600px]">
        {/* Left Sidebar - Progress */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-crhs-navy text-white p-6 md:p-10 flex flex-col relative overflow-hidden shrink-0 md:sticky md:top-[120px] md:self-start md:h-[calc(100vh-140px)]">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-crhs-gold/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-crhs-gold/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase tracking-wider mb-2">Application</h3>
            <p className="text-blue-200 text-sm mb-10">Academic Year 2026-27</p>
            
            <div className="space-y-6">
              {STEPS.map((s, idx) => {
                const isActive = step === s.id;
                const isCompleted = highestStepVisited > s.id;
                const isClickable = s.id <= highestStepVisited;
                
                return (
                  <div 
                    key={s.id} 
                    className={cn(
                      "flex items-start gap-4 transition-all duration-300",
                      isClickable ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
                      isActive ? "scale-105" : "hover:opacity-80"
                    )}
                    onClick={() => handleStepClick(s.id)}
                  >
                    <div className="relative flex flex-col items-center mt-1">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors",
                        isActive ? "bg-crhs-gold text-crhs-navy" : 
                        isCompleted ? "bg-green-500 text-white" : "bg-white/20 text-white"
                      )}>
                        {isCompleted && !isActive ? <Check className="w-4 h-4" /> : s.id}
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className={cn(
                          "w-0.5 h-full absolute top-8 -bottom-6",
                          isCompleted ? "bg-green-500" : "bg-white/20"
                        )} />
                      )}
                    </div>
                    <div>
                      <h4 className={cn("font-bold", isActive ? "text-crhs-gold" : "text-white")}>{s.title}</h4>
                      <p className="text-xs text-blue-200 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content - Form */}
        <div className="w-full md:w-2/3 lg:w-3/4 p-6 md:p-10 lg:p-12 relative">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-grow">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step 1: Student Details */}
                  {step === 1 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-black text-crhs-navy uppercase tracking-wider mb-2">Student Details</h2>
                        <p className="text-slate-500 text-sm">Enter the applicant's personal information.</p>
                      </div>

                      {targetCourse && (
                        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded">
                              Targeted Course Batch
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" /> Admissions Open
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-crhs-navy">{targetCourse.title}</h3>
                          <p className="text-xs text-slate-600 font-medium">{targetCourse.target}</p>
                          {targetCourse.batchTiming && (
                            <p className="text-[11px] text-amber-800 font-bold mt-1 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {targetCourse.batchTiming}
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">First Name <span className="text-red-500">*</span></label>
                          <Input 
                            name="firstName" 
                            value={formData.firstName} 
                            onChange={handleInputChange} 
                            placeholder="Enter first name" 
                            required 
                            className="bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Middle Name</label>
                          <Input 
                            name="middleName" 
                            value={formData.middleName} 
                            onChange={handleInputChange} 
                            placeholder="Enter middle name"
                            className="bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Last Name <span className="text-red-500">*</span></label>
                          <Input 
                            name="lastName" 
                            value={formData.lastName} 
                            onChange={handleInputChange} 
                            placeholder="Enter last name" 
                            required 
                            className="bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Date of Birth <span className="text-red-500">*</span></label>
                          <CustomDatePicker 
                            selected={dob} 
                            onChange={(date) => setDob(date)} 
                            placeholderText="Select date of birth"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Gender <span className="text-red-500">*</span></label>
                          <div className="grid grid-cols-3 gap-3">
                            {['Male', 'Female', 'Other'].map(g => (
                              <div 
                                key={g}
                                onClick={() => setGender(g)}
                                className={cn(
                                  "border rounded-md px-3 py-2 text-center text-sm font-semibold cursor-pointer transition-colors",
                                  gender === g 
                                    ? "border-crhs-navy bg-blue-50 text-crhs-navy" 
                                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                                )}
                              >
                                {g}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Blood Group <span className="text-red-500">*</span></label>
                          <CustomSelect 
                            options={[
                              { value: 'A+', label: 'A+' },
                              { value: 'A-', label: 'A-' },
                              { value: 'B+', label: 'B+' },
                              { value: 'B-', label: 'B-' },
                              { value: 'AB+', label: 'AB+' },
                              { value: 'AB-', label: 'AB-' },
                              { value: 'O+', label: 'O+' },
                              { value: 'O-', label: 'O-' },
                            ]}
                            value={formData.bloodGroup}
                            onChange={(val) => setFormData(prev => ({ ...prev, bloodGroup: val }))}
                            placeholder="Select blood group"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Aadhaar Number <span className="text-red-500">*</span></label>
                          <Input 
                            name="aadhaarNumber" 
                            value={formData.aadhaarNumber} 
                            onChange={handleInputChange} 
                            placeholder="12-digit Aadhaar number" 
                            required 
                            className="bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Mode of Study Selection */}
                      <div className="space-y-2 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                        <label className="text-sm font-bold text-crhs-navy block">Preferred Mode of Coaching <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { value: 'Online Live Class', label: '💻 Online Live Interactive Class', sub: 'Study from home via mobile/laptop app' },
                            { value: 'Offline Classroom', label: '🏫 Offline Physical Classroom', sub: 'Campus batches at Siwan center' }
                          ].map(mode => (
                            <div 
                              key={mode.value}
                              onClick={() => setStudyMode(mode.value)}
                              className={cn(
                                "border-2 rounded-lg p-3 cursor-pointer transition-all",
                                studyMode === mode.value
                                  ? "border-amber-500 bg-white shadow-md"
                                  : "border-slate-200 bg-slate-50 hover:bg-white"
                              )}
                            >
                              <p className="font-extrabold text-xs text-crhs-navy">{mode.label}</p>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{mode.sub}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Course / Batch Applied For <span className="text-red-500">*</span></label>
                          {targetCourse ? (
                            <div className="p-3 bg-slate-100 border-2 border-slate-300 rounded-lg flex items-center justify-between">
                              <span className="text-xs sm:text-sm font-black text-crhs-navy">{classApplied || targetCourse.title}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                                Selected Batch
                              </span>
                            </div>
                          ) : (
                            <CustomSelect 
                              options={
                                openCourses.length > 0
                                  ? openCourses.map(c => ({ 
                                      value: c.title, 
                                      label: `${c.title} • ${c.academicSession || 'Admissions Open'}` 
                                    }))
                                  : [
                                    { value: 'School Academic Batches (Class 6th to 12th)', label: 'School Academic Batches (Class 6th to 12th)' },
                                    { value: 'Suryoday Computer Classes (CCC / ADCA / DCA / Tally)', label: 'Suryoday Computer Classes (CCC / ADCA / DCA / Tally)' },
                                    { value: 'Suryoday Competition Classes (General Competition)', label: 'Suryoday Competition Classes (General Competition)' },
                                    { value: 'Target JEE & NEET Foundation Batch', label: 'Target JEE & NEET Foundation Batch' },
                                  ]
                              }
                              value={classApplied}
                              onChange={(val) => setClassApplied(val)}
                              placeholder="Select course or batch"
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Category</label>
                          <CustomSelect 
                            options={[
                              { value: 'General', label: 'General' },
                              { value: 'OBC', label: 'OBC' },
                              { value: 'SC', label: 'SC' },
                              { value: 'ST', label: 'ST' },
                              { value: 'EWS', label: 'EWS' },
                            ]}
                            value={category}
                            onChange={(val) => setCategory(val)}
                            placeholder="Select category"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Parent Details */}
                  {step === 2 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-black text-crhs-navy uppercase tracking-wider mb-2">Parent Details</h2>
                        <p className="text-slate-500 text-sm">Enter guardian and contact information.</p>
                      </div>
                      
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-6">
                        <h3 className="font-bold text-crhs-navy border-b border-slate-200 pb-2">Father's Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Father's Name <span className="text-red-500">*</span></label>
                            <Input name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Full name" required className="bg-white border-slate-200" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Mobile Number <span className="text-red-500">*</span></label>
                            <Input name="fatherPhone" value={formData.fatherPhone} onChange={handleInputChange} placeholder="10-digit number" required className="bg-white border-slate-200" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Qualification</label>
                            <Input name="fatherQual" value={formData.fatherQual} onChange={handleInputChange} placeholder="e.g. B.Tech, M.Com" className="bg-white border-slate-200" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Occupation</label>
                            <Input name="fatherOcc" value={formData.fatherOcc} onChange={handleInputChange} placeholder="e.g. Business, Service" className="bg-white border-slate-200" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-6">
                        <h3 className="font-bold text-crhs-navy border-b border-slate-200 pb-2">Mother's Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Mother's Name <span className="text-red-500">*</span></label>
                            <Input name="motherName" value={formData.motherName} onChange={handleInputChange} placeholder="Full name" required className="bg-white border-slate-200" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Mobile Number</label>
                            <Input name="motherPhone" value={formData.motherPhone} onChange={handleInputChange} placeholder="10-digit number" className="bg-white border-slate-200" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Qualification</label>
                            <Input name="motherQual" value={formData.motherQual} onChange={handleInputChange} placeholder="e.g. B.A., M.Sc" className="bg-white border-slate-200" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Occupation</label>
                            <Input name="motherOcc" value={formData.motherOcc} onChange={handleInputChange} placeholder="e.g. Homemaker, Teacher" className="bg-white border-slate-200" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-crhs-navy border-b border-slate-200 pb-2 mb-6">Residential Address</h3>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Street Address <span className="text-red-500">*</span></label>
                            <Input name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} placeholder="House no, Street, Area" required className="bg-slate-50 border-slate-200 focus:bg-white" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">City/Village <span className="text-red-500">*</span></label>
                              <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="City" required className="bg-slate-50 border-slate-200 focus:bg-white" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">State <span className="text-red-500">*</span></label>
                              <Input name="state" value={formData.state} onChange={handleInputChange} placeholder="State" required className="bg-slate-50 border-slate-200 focus:bg-white" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">Pincode <span className="text-red-500">*</span></label>
                              <Input name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="6-digit pincode" required className="bg-slate-50 border-slate-200 focus:bg-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Academic & Transport */}
                  {step === 3 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-black text-crhs-navy uppercase tracking-wider mb-2">Academic & Transport</h2>
                        <p className="text-slate-500 text-sm">Previous school details and transport requirements.</p>
                      </div>

                      <div className="space-y-4 border-b border-slate-100 pb-8">
                        <label className="text-sm font-bold text-slate-700">Has the student previously studied in any school? <span className="text-red-500">*</span></label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="prevStudy" className="w-4 h-4 text-crhs-navy focus:ring-crhs-navy" onChange={() => setPreviouslyStudied('Yes')} checked={previouslyStudied === 'Yes'} />
                            <span className="text-sm font-semibold text-slate-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="prevStudy" className="w-4 h-4 text-crhs-navy focus:ring-crhs-navy" onChange={() => setPreviouslyStudied('No')} checked={previouslyStudied === 'No'} />
                            <span className="text-sm font-semibold text-slate-700">No</span>
                          </label>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {previouslyStudied === 'Yes' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-6 overflow-hidden"
                          >
                            <h3 className="font-bold text-crhs-navy border-b border-slate-200 pb-2">Previous School Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">School Name</label>
                                <Input name="prevSchool" value={formData.prevSchool} onChange={handleInputChange} placeholder="Name of previous school" className="bg-white border-slate-200" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">City</label>
                                <Input name="prevCity" value={formData.prevCity} onChange={handleInputChange} placeholder="City of previous school" className="bg-white border-slate-200" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Class Last Attended</label>
                                <Input name="prevClass" value={formData.prevClass} onChange={handleInputChange} placeholder="e.g. Class V" className="bg-white border-slate-200" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Grade/Percentage</label>
                                <Input name="prevGrade" value={formData.prevGrade} onChange={handleInputChange} placeholder="e.g. A or 85%" className="bg-white border-slate-200" />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                  Transfer Certificate (TC) Number
                                  <div className="relative">
                                    <Info className="w-4 h-4 text-slate-400 cursor-help" onClick={(e) => handleInfoClick(e, 3)} />
                                    <AnimatePresence>
                                      {activeInfo === 3 && (
                                        <motion.div 
                                          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10"
                                        >
                                          Required for Class II onwards at the time of final admission.
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </label>
                                <Input name="tcNumber" value={formData.tcNumber} onChange={handleInputChange} placeholder="Leave blank if not yet issued" className="bg-white border-slate-200" />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-4 pt-6 border-t border-slate-100">
                        <label className="text-sm font-bold text-slate-700">Do you require school transport? <span className="text-red-500">*</span></label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="transport" className="w-4 h-4 text-crhs-navy focus:ring-crhs-navy" onChange={() => setBusRequired('Yes')} checked={busRequired === 'Yes'} />
                            <span className="text-sm font-semibold text-slate-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="transport" className="w-4 h-4 text-crhs-navy focus:ring-crhs-navy" onChange={() => setBusRequired('No')} checked={busRequired === 'No'} />
                            <span className="text-sm font-semibold text-slate-700">No</span>
                          </label>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {busRequired === 'Yes' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 overflow-hidden"
                          >
                            <label className="text-sm font-bold text-slate-700">Preferred Bus Stop / Area</label>
                            <Input name="busStop" value={formData.busStop} onChange={handleInputChange} placeholder="Enter your nearest landmark or area" className="bg-slate-50 border-slate-200 focus:bg-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Step 4: Documents (Demo only) */}
                  {step === 4 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-black text-crhs-navy uppercase tracking-wider mb-2">Document Submission</h2>
                        <p className="text-slate-500 text-sm">Please bring the following documents to the school office for physical verification after form submission.</p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                        <h3 className="font-bold text-crhs-navy mb-4 flex items-center gap-2">
                          <Info className="w-5 h-5" /> Online Submission Notice
                        </h3>
                        <p className="text-sm text-slate-700 leading-relaxed mb-4">
                          To streamline the admission process, document uploads are currently disabled. You are only required to submit the application form online. 
                        </p>
                        <p className="text-sm font-bold text-crhs-navy">
                          Our admission desk will contact you to schedule an interview and document verification appointment.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-800">Checklist of documents to bring later:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            "Original Birth Certificate (for verification)",
                            "Aadhaar Card Copy of Student",
                            "Passport Size Photos (Student & Parents)",
                            "Transfer Certificate (Class II onwards)",
                            "Previous Year's Report Card",
                            "Medical Certificate"
                          ].map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                              <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                              <span className="text-sm font-semibold text-slate-700">{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8">
                        <label className="flex items-start gap-4 cursor-pointer group">
                          <div className="relative flex items-center justify-center shrink-0 mt-1">
                            <input 
                              type="checkbox" 
                              required
                              className="peer sr-only"
                            />
                            <div className={cn(
                              "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors border-slate-300 bg-white peer-checked:bg-crhs-navy peer-checked:border-crhs-navy"
                            )}>
                              <Check className="w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform" />
                            </div>
                          </div>
                          <span className="text-sm text-slate-600 leading-relaxed">
                            I hereby declare that the information given above is true and correct to the best of my knowledge and belief. I have read the rules and regulations of the school and I agree to abide by them.
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-8 mt-8 border-t border-slate-100 flex justify-between items-center bg-white sticky bottom-0 z-20 pb-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                className={cn("px-6", step === 1 ? "invisible" : "")}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              
              <Button 
                type="submit" 
                variant="primary" 
                className={cn("px-8", getRadiusClass())}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </span>
                ) : step === totalSteps ? (
                  <span className="flex items-center">Submit Application <Check className="w-4 h-4 ml-2" /></span>
                ) : (
                  <span className="flex items-center">Next Step <ChevronRight className="w-4 h-4 ml-2" /></span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
}
