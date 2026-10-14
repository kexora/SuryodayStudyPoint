import React, { useState } from 'react';
import { Button } from '@/common/components/ui/Button';
import { Input } from '@/common/components/ui/Input';
import { CustomSelect } from '@/common/components/ui/CustomSelect';
import { Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SUBJECT_OPTIONS = [
  { value: 'admission', label: 'Admissions' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'academics', label: 'Academics & Curriculum' },
  { value: 'facilities', label: 'Campus Facilities' },
  { value: 'feedback', label: 'Feedback & Suggestions' }
];

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (value: string) => {
    setFormData(prev => ({ ...prev, subject: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }, 5000);
    }, 1500);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-16 text-center space-y-4"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-wider text-crhs-navy">Message Sent!</h3>
            <p className="text-slate-500 max-w-md font-medium">
              Thank you for reaching out to us. We have received your message and will get back to you shortly.
            </p>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">First Name <span className="text-red-500">*</span></label>
                <Input 
                  required 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  type="text" 
                  placeholder="John"
                  className="bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                <Input 
                  required 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  type="text" 
                  placeholder="Doe"
                  className="bg-slate-50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                <Input 
                  required 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  type="email" 
                  placeholder="john.doe@example.com"
                  className="bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Phone Number</label>
                <Input 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  type="tel" 
                  placeholder="+91 98765 43210"
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Subject <span className="text-red-500">*</span></label>
              <CustomSelect 
                options={SUBJECT_OPTIONS}
                value={formData.subject}
                onChange={handleSubjectChange}
                placeholder="Select a topic of inquiry"
                className="bg-slate-50"
              />
              {/* Hidden input for HTML5 validation of select */}
              <input type="text" className="absolute w-0 h-0 opacity-0 pointer-events-none" required value={formData.subject} onChange={() => {}} tabIndex={-1} />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Your Message <span className="text-red-500">*</span></label>
              <textarea 
                required 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5} 
                className="flex w-full border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crhs-navy focus-visible:border-crhs-navy disabled:cursor-not-allowed disabled:opacity-50 font-medium resize-none transition-all rounded-none"
                placeholder="How can we help you today?"
              ></textarea>
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                className="w-full md:w-auto" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Message...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" /> Send Message
                  </span>
                )}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
