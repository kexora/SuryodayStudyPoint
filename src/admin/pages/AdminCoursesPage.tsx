import React from 'react';
import { AdminCourses } from '@/admin/components/AdminCourses';
import { SEO } from '@/common/components/ui/SEO';

export function AdminCoursesPage() {
  return (
    <>
      <SEO 
        title="Admin Courses & Academics | Suryoday Study Point"
        description="Manage courses, curriculums, and course-specific online admissions."
      />
      <div className="py-6 md:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminCourses />
      </div>
    </>
  );
}
