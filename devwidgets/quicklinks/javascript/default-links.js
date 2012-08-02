define(function() {
    return {
        "userSectionIndex" : 3,
        "sections" : [
            {
                "label" : "Academic",
                "links" : [
                    {
                        "id": "academic_calendars",
                        "name": "Academic Calendar",
                        "url": "http://registrar.berkeley.edu/CalendarDisp.aspx?terms=current",
                        "popup_description": "Academic Calendars.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id"   : "academic_departments_a-z",
                        "name" : "Academic Departments A-Z",
                        "url" : "http://berkeley.edu/academics/dept/a.shtml",
                        "popup_description": "Explore campus majors.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id"   : "advising_tutoring",
                        "name" : "Advising & Tutoring",
                        "url" : "http://berkeley.edu/academics/advise.shtml",
                        "popup_description": "Learning resources and services for students.",
                        "roles" : [ "Faculty", "Students" ]
                    },
                    {
                        "id"   : "bspace",
                        "name" : "bSpace",
                        "url" : "http://bspace.berkeley.edu",
                        "popup_description": "Homework assignments, lecture slides, syllabi, and class resources.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id"   : "campus_bookstore",
                        "name" : "Campus Bookstore",
                        "url"  : "http://www.bkstr.com/webapp/wcs/stores/servlet/StoreCatalogDisplay?storeId=10433",
                        "popup_description": "Textbooks and more.",
                        "roles" : [ "Faculty", "Students" ]
                    },
                    {
                        "id": "classroom_tech",
                        "name": "Classroom Technology",
                        "url": "http://ets.berkeley.edu/classroom-technology/",
                        "popup_description": "Classroom technology, help and resources.",
                        "roles" : [ "Faculty" ]
                    },
                    {
                        "id": "course_catalog",
                        "name": "Course Catalog",
                        "url": "http://sis.berkeley.edu/catalog/gcc_search_menu",
                        "popup_description": "Detailed course descriptions.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id"   : "dars",
                        "name" : "DARS",
                        "url"  : "https://marin.berkeley.edu/darsweb/servlet/ListAuditsServlet",
                        "popup_description": "Degree requirements and track progress.",
                        "roles" : [ "Staff", "Students" ]
                    },
                    {
                        "id": "decal",
                        "name": "DeCal Courses",
                        "url": "http://www.decal.org",
                        "popup_description": "Catalog of student-led courses.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "development_recognition_fellowships",
                        "name": "Development, recognition and fellowships",
                        "url": "http://www.berkeley.edu/teach/award.shtml",
                        "popup_description": "Faculty workshops, grants, fellowships and Awards.",
                        "roles" : [ "Faculty" ]
                    },
                    {
                        "id": "disabled_students_program",
                        "name": "Disabled Students Program",
                        "url": "http://dsp.berkeley.edu/",
                        "popup_description": "Services in support of equal access to educational opportunities for disabled students.",
                        "roles" : [ "Staff", "Students" ]
                    },
                    {
                        "id": "discovery_courses",
                        "name": "Discovery Courses",
                        "url": "http://lsdiscovery.berkeley.edu/",
                        "popup_description": "L&S classes taught by distinguished faculty.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "educational_development_office",
                        "name": "Educational Development Office",
                        "url": "http://oed.berkeley.edu/",
                        "popup_description": "Support and promotion of teaching efforts of faculty at Berkeley.",
                        "roles" : [ "Faculty" ]
                    },
                    {
                        "id": "executive_education",
                        "name": "Executive Education Program",
                        "url": "http://executive.berkeley.edu/programs",
                        "popup_description": "Professional, executive-level classes, at the Haas School of Business.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "faculty_expertise_database",
                        "name": "Faculty Expertise Database",
                        "url": "http://vcresearch.berkeley.edu/faculty-expertise",
                        "popup_description": "Find faculty by specialization and expertise.",
                        "roles" : [ "Faculty" ]
                    },
                    {
                        "id": "freshman_sophomore_seminars",
                        "name": "Freshman & Sophomore Seminars",
                        "url": "http://fss.berkeley.edu/",
                        "popup_description": "Small-group faculty-taught undergraduate courses on an wide range of topics.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "graduate_division",
                        "name": "Graduate Division",
                        "url": "http://www.grad.berkeley.edu/",
                        "popup_description": "Information for graduate students.",
                        "roles" : [ "Students", "Faculty" ]
                    },
                    {
                        "id": "gsi_resource_center",
                        "name": "GSI Resource Center",
                        "url": "http://gsi.berkeley.edu/",
                        "popup_description": "GSI tools, training and more.",
                        "roles" : [ "Students", "Faculty" ]
                    },
                    {
                        "id": "language_center",
                        "name": "Language Center",
                        "url": "http://blc.berkeley.edu/",
                        "popup_description": "Language study resources for students and instructors.",
                        "roles" : [ "Students", "Faculty" ]
                    },
                    {
                        "id": "library",
                        "name": "Library",
                        "url": "http://www.lib.berkeley.edu",
                        "popup_description": "Search the UC library system.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "museum_collections",
                        "name": "Museum & Collections",
                        "url": "http://www.mip.berkeley.edu/mip/collections/collections.html",
                        "popup_description": "Explore Berkeley's many museums and collections.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "publications_journals",
                        "name": "Publications & Journals",
                        "url": "http://berkeley.edu/research/pub.shtml",
                        "popup_description": "Berkeley's many newsletters and journals.",
                        "roles" : [ "Students", "Faculty" ]
                    },
                    {
                        "id": "research",
                        "name": "Research",
                        "url": "http://vcresearch.berkeley.edu/",
                        "popup_description": "Overview of Berkeley's Research program and resources.",
                        "roles" : [ "Students", "Faculty" ]
                    },
                    {
                        "id": "schedule_planning",
                        "name": "Schedule Planning",
                        "url": "https://schedulebuilder.berkeley.edu/",
                        "popup_description": "Plan your classes.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "schools_colleges",
                        "name": "Schools & Colleges",
                        "url": "http://berkeley.edu/academics/school.shtml",
                        "popup_description": "A list of Berkeley's schools and colleges.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "science_engineering_literacy",
                        "name": "Science & Engineering Literacy",
                        "url": "http://www.lib.berkeley.edu/sciences/cseill",
                        "popup_description": "Programs and tools to support the teaching and research goals of faculty and students.",
                        "roles" : [ "Students", "Faculty" ]
                    },
                    {
                        "id": "study_abroad",
                        "name": "Study Abroad",
                        "url": "https://studyabroad-prod.berkeley.edu/",
                        "popup_description": "Participating institutions and program information.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "summer_sessions",
                        "name": "Summer Sessions",
                        "url": "http://summer.berkeley.edu/",
                        "popup_description": "Summer classes at UC Berkeley.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "teaching_resources",
                        "name": "Teaching Resources",
                        "url": "http://teaching.berkeley.edu/teaching.html",
                        "popup_description": "Planning your class and thinking about teaching.",
                        "roles" : [ "Faculty" ]
                    },
                    {
                        "id": "tele_bears",
                        "name": "Tele-BEARS",
                        "url": "http://telebears.berkeley.edu",
                        "popup_description": "Register for classes.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "uc_extension",
                        "name": "UC Extension",
                        "url": "http://extension.berkeley.edu/",
                        "popup_description": "Professional and Continuing Education.",
                        "roles" : [ "ALL" ]
                    }
                ]
            },
            {
                "label" : "Administrative",
                "links" : [
                    {
                        "id": "admissions_grad",
                        "name": "Admissions (graduate)",
                        "url": "http://www.grad.berkeley.edu/admissions/",
                        "popup_description": "Admissions instructions for graduate students.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "admissions_undergrad",
                        "name": "Admissions (undergraduate)",
                        "url": "http://students.berkeley.edu/admissions/index.asp",
                        "popup_description": "Admissions instructions for undergraduate students.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "bear_facts",
                        "name": "Bear Facts",
                        "url": "https://bearfacts.berkeley.edu/bearfacts/student/studentMain.do?bfaction=welcome",
                        "popup_description": "Academic record, grades & transcript, bill, degree audit, loans, SLR & personal info.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "berkeley_facts",
                        "name": "Berkeley facts-at-a-glance",
                        "url": "http://berkeley.edu/about/fact.shtml",
                        "popup_description": "Statistics on the student body, faculty, and more.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "billing_payment",
                        "name": "Billing & Payment Services (student)",
                        "url": "http://studentbilling.berkeley.edu/carsBilling.htm",
                        "popup_description": "CARS billing and more.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "calmail",
                        "name": "CalMail",
                        "url": "http://calmail.berkeley.edu",
                        "popup_description": "Campus email system.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "career_center",
                        "name": "Career Center",
                        "url": "http://career.berkeley.edu",
                        "popup_description": "Cal jobs, internships & career counseling.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "classroom_technology",
                        "name": "Classroom Technology services",
                        "url": "http://ets.berkeley.edu/classroom-technology/",
                        "popup_description": "Audio/video equipment, webcasting, video conferencing, and more.",
                        "roles" : [ "Faculty" ]
                    },
                    {
                        "id": "computing",
                        "name": "Computing",
                        "url": "http://www.berkeley.edu/admin/compute.shtml",
                        "popup_description": "Campus computing resource, systems support, and IT services.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "directory",
                        "name": "Directory",
                        "url": "https://calnet.berkeley.edu/directory/",
                        "popup_description": "Search For People at UC Berkeley.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "emp_benefits",
                        "name": "Employee Benefits - At Your Service",
                        "url": "http://atyourservice.ucop.edu",
                        "popup_description": "Search For People at UC Berkeley.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "events_berkeley",
                        "name": "Events Berkeley",
                        "url": "http://events.berkeley.edu",
                        "popup_description": "Campus events calendar.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "fees",
                        "name": "Fees (undergrad & grad)",
                        "url": "http://registrar.berkeley.edu/Registration/feesched.html",
                        "popup_description": "Latest student fee data, resident and non-resident, graduate and undergraduate.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "finaid",
                        "name": "Financial Aid",
                        "url": "http://students.berkeley.edu/finaid",
                        "popup_description": "Student financial aid options and select scholarships.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "human_resources",
                        "name": "Human Resources",
                        "url": "http://hrweb.berkeley.edu/",
                        "popup_description": "Human Resources.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "international_office",
                        "name": "International Office",
                        "url": "http://internationaloffice.berkeley.edu/",
                        "popup_description": "Resources and visa information for international students, faculty and staff.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "jobs",
                        "name": "Job Listings",
                        "url": "http://jobs.berkeley.edu/",
                        "popup_description": "Job Listings for student, staff and academic positions.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "operational_excellence",
                        "name": "Operational Excellence (OE)",
                        "url": "http://oe.berkeley.edu/",
                        "popup_description": "OE main initiative information site.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "org_charts",
                        "name": "Organizational Charts",
                        "url": "http://berkeley.edu/admin/org.shtml",
                        "popup_description": "Key administrators and organizational charts.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "payroll",
                        "name": "Payroll Services",
                        "url": "http://controller.berkeley.edu/payroll/",
                        "popup_description": "Campus payroll office: earnings statements, payroll forms, online reporting and resources.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "registrar",
                        "name": "Registrar",
                        "url": "http://registrar.berkeley.edu/",
                        "popup_description": "Office of the Registrar, academic calendar and much more.",
                        "roles" : [ "Faculty", "Students" ]
                    },
                    {
                        "id": "shared_services_center",
                        "name": "Shared Services Center (CSS)",
                        "url": "http://sharedservices.berkeley.edu/",
                        "popup_description": "Shared Services Center initiative website.",
                        "roles" : [ "Faculty", "Staff" ]
                    },
                    {
                        "id": "staff_ombuds",
                        "name": "Staff Ombuds",
                        "url": "http://staffombuds.berkeley.edu/",
                        "popup_description": "The Staff Ombuds Office is an independent department that provides strictly confidential and informal conflict resolution and problem-solving services for all Staff, Non-Senate Academics, and Faculty who perform management functions.",
                        "roles" : [ "Faculty", "Staff" ]
                    },
                    {
                        "id": "student_ombuds",
                        "name": "Student Ombuds",
                        "url": "http://campuslife.berkeley.edu/ombuds",
                        "popup_description": "Assistance sorting through a campus-related conflict or concern.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "student_orientation",
                        "name": "Student Orientation (CalSO)",
                        "url": "http://services.housing.berkeley.edu/NSS/Content/Welcome.html",
                        "popup_description": "Orientation program for undergraduate freshman and transfer students and their parents.",
                        "roles" : [ "Students" ]
                    }
                ]
            },
            {
                "label" : "Campus Life",
                "links" : [
                    {
                        "id": "asuc",
                        "name": "ASUC",
                        "url": "http://www.asuc.org",
                        "popup_description": "Student government.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "atoz_sites",
                        "name": "Berkeley Sites (A-Z)",
                        "url": "http://www.berkeley.edu/a-z/a.shtml",
                        "popup_description": "Navigating UC Berkeley.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "calbears",
                        "name": "CalBears Athletics Calendar",
                        "url": "http://www.calbears.com/calendar/cal-calendar.html",
                        "popup_description": "Cal Athletics official website.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "cal1card",
                        "name": "Cal-1-Card",
                        "url": "http://services.housing.berkeley.edu/c1c/static/aboutc1c.htm",
                        "popup_description": "Identification card for students, staff and faculty.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "caldining",
                        "name": "CalDining",
                        "url": "http://caldining.berkeley.edu",
                        "popup_description": "Campus dining facilities.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "campus_map",
                        "name": "Campus Map",
                        "url": "http://berkeley.edu/map",
                        "popup_description": "Locate campus buildings.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "care_services",
                        "name": "CARE Services",
                        "url": "http://uhs.berkeley.edu/facstaff/care/",
                        "popup_description": "CARE Services is the campus faculty and staff assistance program providing free, confidential problem assessment and referral for UC Berkeley faculty and staff.",
                        "roles" : [ "Faculty", "Staff" ]
                    },
                    {
                        "id": "emergency_information",
                        "name": "Emergency information",
                        "url": " https://emergency.berkeley.edu/",
                        "popup_description": "Go-to site for emergency response information.",
                        "roles" : [ "Faculty", "Staff" ]
                    },
                    {
                        "id": "equity_inclusion_diversity",
                        "name": "Equity, Inclusion & Diversity",
                        "url": " http://diversity.berkeley.edu/",
                        "popup_description": "E&I Division programs and resources.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "graduate_assembly",
                        "name": "Graduate Assembly",
                        "url": "http://ga.berkeley.edu",
                        "popup_description": "Graduate student government",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "uhs",
                        "name": "Health Services - Tang Center",
                        "url": "http://uhs.berkeley.edu",
                        "popup_description": "Campus healthcare.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "osher_lifelong_learning",
                        "name": "Osher Lifelong Learning Institute",
                        "url": "http://olli.berkeley.edu/",
                        "popup_description": "Courses, lectures, and special events, designed for adults age 50 and above.",
                        "roles" : [ "Faculty", "Staff" ]
                    },
                    {
                        "id": "parking_and_transportation",
                        "name": "Parking & Transportation",
                        "url": "http://pt.berkeley.edu/park",
                        "popup_description": "Parking lots, transportation, car sharing, etc.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "police_and_safety",
                        "name": "Police & Safety",
                        "url": "http://police.berkeley.edu",
                        "popup_description": "Police programs and services, forms, safety information, comments and questions.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "public_service",
                        "name": "Public Service",
                        "url": "http://calcorps.berkeley.edu",
                        "popup_description": "On and off campus community service engagement.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "rsf",
                        "name": "Recreational Sports Facility",
                        "url": "http://www.recsports.berkeley.edu",
                        "popup_description": "Sports and fitness programs.",
                        "roles" : [ "ALL" ]
                    },
                    {
                        "id": "rescomp",
                        "name": "Residential Computing",
                        "url": "http://rescomp.berkeley.edu",
                        "popup_description": "Computer and network services for resident students.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "resource_guide",
                        "name": "Resource Guide for Students",
                        "url": "http://resource.berkeley.edu",
                        "popup_description": "Comprehensive campus guide for students.",
                        "roles" : [ "Students" ]
                    },

                    {
                        "id": "student_groups",
                        "name": "Student Groups and Programs",
                        "url": "http://students.berkeley.edu/osl",
                        "popup_description": "Search for and join campus student organizations.",
                        "roles" : [ "Students" ]
                    },

                    {
                        "id": "student_services",
                        "name": "Student Services",
                        "url": "http://www.berkeley.edu/students",
                        "popup_description": "Student services and programs.",
                        "roles" : [ "Students" ]
                    },
                    {
                        "id": "transfer_center",
                        "name": "Transfer, Re-entry & Student Parent Center",
                        "url": "http://trsp.berkeley.edu/",
                        "popup_description": "Student services and programs.",
                        "roles" : [ "Students" ]
                    }
                ]
            },
            {
                "label" : "My Links",
                "links" : [],
                "isEditable" : true,
                "activeSection" : 0
            }
        ]
    };
});