import {
  StudentProfile,
  Opportunity,
  ApplicationItem,
  IndustryChallenge,
  AcademicMatch,
  CollegeDetail,
  CollaborationWorkspace,
} from '../types';

export const initialStudentProfile: StudentProfile = {
  name: 'Vijay Bhosale',
  title: 'B.Tech Computer Science Student',
  institution: 'Walchand College of Engineering',
  degree: 'B.Tech Computer Science',
  branch: 'Computer Science & Engineering',
  location: 'Pune, Maharashtra',
  about: 'Computer Science student passionate about software development, AI and emerging technologies. Focused on bridging academic concepts with production-grade industry engineering.',
  profileCompletion: 82,
  targetRole: 'AI / ML Engineer',
  skills: [
    { id: '1', name: 'Python', category: 'Programming', proficiency: 'Advanced', verified: true },
    { id: '2', name: 'JavaScript', category: 'Programming', proficiency: 'Advanced', verified: true },
    { id: '3', name: 'C++', category: 'Programming', proficiency: 'Intermediate', verified: false },
    { id: '4', name: 'Java', category: 'Programming', proficiency: 'Intermediate', verified: false },
    { id: '5', name: 'HTML', category: 'Web Development', proficiency: 'Advanced', verified: true },
    { id: '6', name: 'CSS', category: 'Web Development', proficiency: 'Advanced', verified: true },
    { id: '7', name: 'React', category: 'Web Development', proficiency: 'Advanced', verified: true },
    { id: '8', name: 'Node.js', category: 'Web Development', proficiency: 'Intermediate', verified: false },
    { id: '9', name: 'Machine Learning', category: 'AI / Machine Learning', proficiency: 'Intermediate', verified: true },
    { id: '10', name: 'Computer Vision', category: 'AI / Machine Learning', proficiency: 'Beginner', verified: false },
    { id: '11', name: 'SQL', category: 'Database', proficiency: 'Advanced', verified: true },
    { id: '12', name: 'PostgreSQL', category: 'Database', proficiency: 'Intermediate', verified: true },
    { id: '13', name: 'AWS', category: 'Cloud', proficiency: 'Beginner', verified: false },
    { id: '14', name: 'Firebase', category: 'Cloud', proficiency: 'Intermediate', verified: true },
  ],
  strengths: ['Python', 'JavaScript', 'React', 'SQL'],
  developing: ['Machine Learning', 'Computer Vision'],
  recommendedSkills: [
    {
      name: 'Computer Vision',
      reason: '6 relevant industry opportunities currently require this skill.',
      demandCount: 6,
    },
    {
      name: 'FastAPI',
      reason: 'Core requirement for deploying AI models into low-latency production microservices.',
      demandCount: 9,
    },
    {
      name: 'Cloud Deployment',
      reason: 'Essential for containerized edge deployment and continuous ML model integration.',
      demandCount: 8,
    },
    {
      name: 'Docker',
      reason: 'Required standard for reproducible research-to-production pipelines.',
      demandCount: 7,
    },
  ],
  projects: [
    {
      id: 'p1',
      title: 'CampusBridge',
      description: 'AI-powered academic-industry collaboration platform connecting students, institutions, and enterprises.',
      role: 'Lead Architect',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'FastAPI'],
      link: '#',
      outcomes: 'Selected for WCE-HACKATHON 2026 Finals.',
    },
    {
      id: 'p2',
      title: 'BeyondEyes',
      description: 'Digital wellbeing and ergonomic focus tracking Android application utilizing on-device sensor fusion.',
      role: 'Full Stack Developer',
      technologies: ['Kotlin', 'TensorFlow Lite', 'Android SDK'],
      link: '#',
      outcomes: '1,500+ active beta testers across campus.',
    },
  ],
  certifications: [
    { id: 'c1', name: 'Google Prompting Essentials', issuer: 'Google Cloud Skills Boost', date: 'Jan 2026' },
    { id: 'c2', name: 'AWS Cloud Foundations', issuer: 'Amazon Web Services', date: 'Nov 2025' },
    { id: 'c3', name: 'Practical Machine Learning with PyTorch', issuer: 'DeepLearning.AI', date: 'Aug 2025' },
  ],
  achievements: [
    'Finalist, WCE National Level Hackathon 2026',
    'Academic Excellence Merit Scholarship (Consecutive semesters 2024-2025)',
    'Published technical article on Edge AI Inference optimization with 4.8k reads',
  ],
};

export const sampleOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'AI / ML Internship',
    company: 'ABC Technologies',
    type: 'Internship',
    location: 'Remote · Pune Hybrid',
    duration: '3 Months',
    stipend: '₹35,000 / month',
    matchScore: 91,
    requiredSkills: ['Python', 'Machine Learning', 'OpenCV', 'Computer Vision'],
    matchingSkills: ['Python', 'Machine Learning'],
    gapSkills: ['Computer Vision', 'OpenCV'],
    description: 'Work directly alongside ABC Technologies smart robotics division to train defect-classification models and optimize edge inferencing on industrial production cameras.',
    whatYouWillDo: [
      'Collaborate with the industrial automation team on high-speed defect detection pipelines.',
      'Prepare, augment, and annotate real-world factory line visual datasets.',
      'Train lightweight Convolutional Neural Networks and YOLOv8 models for micro-fracture detection.',
      'Benchmark latency and accuracy trade-offs on edge devices (NVIDIA Jetson / Raspberry Pi).',
    ],
    postedDate: '2 days ago',
  },
  {
    id: 'opp-2',
    title: 'Computer Vision Research Fellow',
    company: 'DeepVision Systems',
    type: 'Research',
    location: 'Bangalore · Onsite',
    duration: '6 Months',
    stipend: '₹42,000 / month',
    matchScore: 84,
    requiredSkills: ['Python', 'Computer Vision', 'PyTorch', 'Docker'],
    matchingSkills: ['Python', 'Machine Learning'],
    gapSkills: ['Computer Vision', 'Docker'],
    description: 'Investigate multi-spectral defect identification algorithms in partnership with academic laboratories for semiconductor wafer inspection.',
    whatYouWillDo: [
      'Implement state-of-the-art vision transformer architectures.',
      'Publish research findings in collaborative institutional symposiums.',
      'Develop benchmarking pipelines on synthetic datasets.',
    ],
    postedDate: '5 days ago',
  },
  {
    id: 'opp-3',
    title: 'Full Stack AI Project Lead',
    company: 'Apex Automation Corp',
    type: 'Project',
    location: 'Remote',
    duration: '2 Months',
    stipend: '₹50,000 Milestone Bonus',
    matchScore: 88,
    requiredSkills: ['React', 'Python', 'FastAPI', 'SQL'],
    matchingSkills: ['React', 'Python', 'SQL'],
    gapSkills: ['FastAPI'],
    description: 'Deliver an interactive inspection telemetry dashboard connected to live automated camera streams for factory supervisors.',
    whatYouWillDo: [
      'Architect real-time analytics dashboards in React & Tailwind.',
      'Integrate FastAPI endpoints streaming bounding-box coordinates.',
      'Conduct user testing with plant operations supervisors.',
    ],
    postedDate: '1 week ago',
  },
  {
    id: 'opp-4',
    title: 'Edge IoT & Smart Sensing Apprentice',
    company: 'Bharat Forge Digital',
    type: 'Internship',
    location: 'Pune',
    duration: '4 Months',
    stipend: '₹30,000 / month',
    matchScore: 78,
    requiredSkills: ['C++', 'Python', 'IoT', 'MQTT'],
    matchingSkills: ['Python', 'C++'],
    gapSkills: ['IoT', 'MQTT'],
    description: 'Design sensor nodes that capture vibration and acoustic telemetry on heavy industrial presses to detect mechanical wear.',
    whatYouWillDo: [
      'Program microcontroller firmware for distributed telemetry capture.',
      'Transmit payload packets over MQTT to central data ingestion broker.',
      'Verify time-series synchronization with high-speed video frames.',
    ],
    postedDate: '2 weeks ago',
  },
  {
    id: 'opp-5',
    title: 'Junior Machine Learning Engineer',
    company: 'Tata Elxsi',
    type: 'Job',
    location: 'Pune, Maharashtra · Hybrid',
    duration: 'Full-Time Graduate Role',
    stipend: '₹8.5 LPA Package',
    matchScore: 89,
    requiredSkills: ['Python', 'Machine Learning', 'Computer Vision', 'FastAPI'],
    matchingSkills: ['Python', 'Machine Learning'],
    gapSkills: ['Computer Vision', 'FastAPI'],
    description: 'Join the autonomous systems and smart vision engineering practice building edge neural perception pipelines for automotive and manufacturing clients.',
    whatYouWillDo: [
      'Implement deep learning model evaluation and quantization for embedded deployment.',
      'Develop microservice interfaces with FastAPI streaming continuous inference results.',
      'Collaborate with academic research partners on next-generation vision models.',
    ],
    postedDate: '3 days ago',
  },
  {
    id: 'opp-6',
    title: 'Industrial Computer Vision & TensorRT Bootcamp',
    company: 'NVIDIA Academic Partner Network',
    type: 'Workshop',
    location: 'Online Interactive Lab',
    duration: '2 Weeks (Self-Paced)',
    stipend: 'Sponsored Certificate with CampusBridge ID',
    matchScore: 95,
    requiredSkills: ['Python', 'Machine Learning', 'OpenCV'],
    matchingSkills: ['Python', 'Machine Learning'],
    gapSkills: ['OpenCV'],
    description: 'Hands-on intensive masterclass on industrial defect detection, OpenCV matrix convolutions, and TensorRT hardware acceleration for students.',
    whatYouWillDo: [
      'Build real-world industrial flaw classification scripts using OpenCV.',
      'Benchmark FP16 and INT8 model quantization on cloud GPU instances.',
      'Earn accredited industrial certification upon capstone submission.',
    ],
    postedDate: 'Just now',
  },
];

export const initialApplications: ApplicationItem[] = [
  {
    id: 'app-1',
    opportunityId: 'opp-1',
    opportunityTitle: 'AI / ML Internship',
    company: 'ABC Technologies',
    type: 'Internship',
    appliedDate: 'Yesterday',
    status: 'Under Review',
    feedback: 'Profile matched 91% illustrative score. Reviewing project portfolio.',
  },
  {
    id: 'app-2',
    opportunityId: 'opp-3',
    opportunityTitle: 'Full Stack AI Project Lead',
    company: 'Apex Automation Corp',
    type: 'Project',
    appliedDate: 'March 28, 2026',
    status: 'Applied',
    feedback: 'Application received and awaiting shortlisting.',
  },
  {
    id: 'app-3',
    opportunityId: 'opp-4',
    opportunityTitle: 'Edge IoT & Smart Sensing Apprentice',
    company: 'Bharat Forge Digital',
    type: 'Internship',
    appliedDate: 'March 15, 2026',
    status: 'Accepted',
    feedback: 'Technical interview cleared. Offer letter issued.',
  },
];

export const initialIndustryChallenge: IndustryChallenge = {
  id: 'chal-1',
  title: 'AI-Based Manufacturing Defect Detection',
  description: 'High-speed automated visual inspection system capable of detecting sub-millimeter surface flaws, micro-scratches, and component misalignment on assembly conveyers moving at 1.5 m/s.',
  requiredSkills: ['Python', 'Machine Learning', 'Computer Vision', 'OpenCV', 'IoT'],
  domain: 'Manufacturing + Artificial Intelligence',
  collaborationType: 'Academic Collaboration',
  academicMatchesCount: 12,
  status: 'Finding Partners',
};

export const academicMatchesData: AcademicMatch[] = [
  {
    id: 'col-1',
    collegeName: 'ABC Engineering College',
    matchScore: 92,
    location: 'Sangli, Maharashtra',
    strengths: [
      'AI/ML Faculty & Research Cluster',
      'Computer Vision Specialized Laboratory',
      'Industrial IoT Testbed & Infrastructure',
      'Vetted Student Project Engineering Team',
      'Prior Track Record in Vision Inspection Projects',
      'Active MoU & IP Collaboration Framework',
    ],
    compatibility: {
      skills: 95,
      domain: 90,
      infrastructure: 88,
      collaborationFit: 94,
    },
    keyFacilities: ['Computer Vision Lab', 'AI/ML High-Compute Cluster', 'IoT Instrumentation Lab'],
    facultyCount: 18,
    activeStudents: 120,
    pastCollaborations: 24,
  },
  {
    id: 'col-2',
    collegeName: 'XYZ Engineering College',
    matchScore: 86,
    location: 'Pune, Maharashtra',
    strengths: [
      'Strong Robotics & Automation Department',
      'Embedded Vision Hardware Stations',
      'Postgraduate ML Research Scholars',
    ],
    compatibility: {
      skills: 88,
      domain: 85,
      infrastructure: 84,
      collaborationFit: 87,
    },
    keyFacilities: ['Robotics Centre', 'Embedded Systems Lab'],
    facultyCount: 14,
    activeStudents: 95,
    pastCollaborations: 18,
  },
  {
    id: 'col-3',
    collegeName: 'DEF Institute of Technology',
    matchScore: 81,
    location: 'Mumbai, Maharashtra',
    strengths: [
      'Center of Excellence in Industry 4.0',
      'High-Performance GPU Cluster',
      'Sensor Integration Testing Facility',
    ],
    compatibility: {
      skills: 82,
      domain: 80,
      infrastructure: 85,
      collaborationFit: 78,
    },
    keyFacilities: ['GPU Supercomputing Pod', 'Digital Manufacturing Cell'],
    facultyCount: 22,
    activeStudents: 140,
    pastCollaborations: 15,
  },
];

export const sampleCollegeDetail: CollegeDetail = {
  id: 'col-1',
  name: 'ABC Engineering College',
  tagline: 'Premier Autonomous Technical Institution with Focus on Applied Innovation',
  about: 'Established technical institution recognized for industry-integrated research and development. Ranked among top tier state engineering campuses with specialized centers in artificial intelligence, embedded systems, and sustainable manufacturing.',
  capabilities: {
    faculty: 18,
    students: '120+',
    specializedLabs: 6,
    relevantProjects: '35+',
  },
  areasOfExpertise: [
    'Artificial Intelligence',
    'Machine Learning',
    'Computer Vision',
    'Industrial IoT',
    'Data Science & Analytics',
  ],
  facilities: [
    'Computer Vision Laboratory (High-speed industrial camera rigs)',
    'AI/ML High-Compute Cluster (NVIDIA A100 GPU nodes)',
    'IoT & Sensor Instrumentation Testing Facility',
    'Cloud Computing & Distributed Systems Lab',
    'Advanced Prototyping & Mechatronics Workshop',
    'Edge AI Hardware Testbed (Jetson Orin, Coral TPU)',
  ],
  industryCollaborationsCompleted: 24,
  departments: [
    'Computer Science & Engineering',
    'Artificial Intelligence & Data Science',
    'Electronics & Telecommunication',
    'Mechanical Automation',
  ],
};

export const sampleCollegesMap: Record<string, CollegeDetail> = {
  'col-1': sampleCollegeDetail,
  'col-2': {
    id: 'col-2',
    name: 'XYZ Engineering College',
    tagline: 'Center for Advanced Mechatronics, Embedded AI & Robotics',
    about: 'Autonomous state engineering campus with dedicated centers of excellence in robotics, microelectronics, and edge automation. Extensive industrial project engagements with automotive and manufacturing leaders.',
    capabilities: {
      faculty: 14,
      students: '95+',
      specializedLabs: 5,
      relevantProjects: '28+',
    },
    areasOfExpertise: [
      'Robotics & Automation',
      'Embedded Vision Systems',
      'Edge Machine Learning',
      'Firmware & Microcontrollers',
      'Industrial Control Systems',
    ],
    facilities: [
      'Robotics & Mechatronics Automation Centre',
      'Embedded Hardware Testing Laboratory',
      'Edge TPU & Microcontroller Bench',
      'Automotive Systems Prototyping Cell',
    ],
    industryCollaborationsCompleted: 18,
    departments: [
      'Robotics & Automation',
      'Computer Science',
      'Mechanical Engineering',
      'Instrumentation & Control',
    ],
  },
  'col-3': {
    id: 'col-3',
    name: 'DEF Institute of Technology',
    tagline: 'Leading Technical Institute for Industry 4.0 & Supercomputing',
    about: 'Premier research institute renowned for high-performance computing clusters and enterprise sensor networks. Actively driving cross-disciplinary translational innovation in semiconductor fabrication and predictive maintenance.',
    capabilities: {
      faculty: 22,
      students: '140+',
      specializedLabs: 8,
      relevantProjects: '42+',
    },
    areasOfExpertise: [
      'Industry 4.0 Architecture',
      'High Performance Supercomputing',
      'Semiconductor Wafer Analytics',
      'Computer Vision & TensorRT',
      'Big Data Distributed Pipelines',
    ],
    facilities: [
      'GPU Supercomputing Pod (NVIDIA DGX Cluster)',
      'Digital Smart Manufacturing Factory Cell',
      'Semiconductor Cleanroom Instrumentation Rig',
      'Advanced Sensor Calibration Chamber',
    ],
    industryCollaborationsCompleted: 15,
    departments: [
      'Computer Engineering',
      'Data Science & Artificial Intelligence',
      'Electrical Engineering',
      'Manufacturing Systems',
    ],
  },
};

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Faculty Mentor' | 'Industry Sponsor' | 'Admin';
  organization: string;
  verified: boolean;
  joinedDate: string;
}

export const mockAdminUsers: AdminUser[] = [
  {
    id: 'u-1',
    name: 'Vijay Bhosale',
    email: 'vijay.bhosale@wce.ac.in',
    role: 'Student',
    organization: 'Walchand College of Engineering',
    verified: true,
    joinedDate: 'Jan 12, 2026',
  },
  {
    id: 'u-2',
    name: 'Dr. Rajesh Nair',
    email: 'rajesh.nair@abctech.com',
    role: 'Industry Sponsor',
    organization: 'ABC Technologies',
    verified: true,
    joinedDate: 'Feb 04, 2026',
  },
  {
    id: 'u-3',
    name: 'Prof. Anjali Mehta',
    email: 'a.mehta@abccollege.edu',
    role: 'Faculty Mentor',
    organization: 'ABC Engineering College',
    verified: true,
    joinedDate: 'Jan 20, 2026',
  },
  {
    id: 'u-4',
    name: 'Priya Kulkarni',
    email: 'priya.kulkarni@wce.ac.in',
    role: 'Student',
    organization: 'Walchand College of Engineering',
    verified: true,
    joinedDate: 'Feb 15, 2026',
  },
  {
    id: 'u-5',
    name: 'Suresh Patil',
    email: 'spatil@deepvisionsys.io',
    role: 'Industry Sponsor',
    organization: 'DeepVision Systems',
    verified: true,
    joinedDate: 'Mar 01, 2026',
  },
  {
    id: 'u-6',
    name: 'Dr. Ramesh Kulkarni',
    email: 'r.kulkarni@xyzcollege.edu',
    role: 'Faculty Mentor',
    organization: 'XYZ Engineering College',
    verified: false,
    joinedDate: 'Mar 24, 2026',
  },
];

export interface AdminOrg {
  id: string;
  name: string;
  type: 'University / College' | 'Enterprise Sponsor' | 'Research Lab';
  location: string;
  accredited: boolean;
  activeCollaborations: number;
  contactPerson: string;
}

export const mockAdminOrganizations: AdminOrg[] = [
  {
    id: 'org-1',
    name: 'ABC Engineering College',
    type: 'University / College',
    location: 'Sangli, Maharashtra',
    accredited: true,
    activeCollaborations: 4,
    contactPerson: 'Dr. S. Patil',
  },
  {
    id: 'org-2',
    name: 'ABC Technologies',
    type: 'Enterprise Sponsor',
    location: 'Pune, Maharashtra',
    accredited: true,
    activeCollaborations: 3,
    contactPerson: 'Dr. Rajesh Nair',
  },
  {
    id: 'org-3',
    name: 'XYZ Engineering College',
    type: 'University / College',
    location: 'Pune, Maharashtra',
    accredited: true,
    activeCollaborations: 2,
    contactPerson: 'Dr. Ramesh Kulkarni',
  },
  {
    id: 'org-4',
    name: 'DeepVision Systems',
    type: 'Enterprise Sponsor',
    location: 'Bangalore, Karnataka',
    accredited: true,
    activeCollaborations: 2,
    contactPerson: 'Suresh Patil',
  },
  {
    id: 'org-5',
    name: 'DEF Institute of Technology',
    type: 'University / College',
    location: 'Mumbai, Maharashtra',
    accredited: true,
    activeCollaborations: 3,
    contactPerson: 'Prof. K. Verma',
  },
];

export interface AdminCollaborationItem {
  id: string;
  title: string;
  industry: string;
  college: string;
  studentLead: string;
  status: 'In Progress' | 'Review' | 'Completed';
  progress: number;
  health: 'On Track' | 'Attention' | 'Excellent';
}

export const mockAdminCollaborations: AdminCollaborationItem[] = [
  {
    id: 'ac-1',
    title: 'AI Manufacturing Defect Detection',
    industry: 'ABC Technologies',
    college: 'ABC Engineering College',
    studentLead: 'Vijay Bhosale',
    status: 'In Progress',
    progress: 70,
    health: 'Excellent',
  },
  {
    id: 'ac-2',
    title: 'Semiconductor Wafer Anomaly Vision Pipeline',
    industry: 'DeepVision Systems',
    college: 'DEF Institute of Technology',
    studentLead: 'Rohan Sharma',
    status: 'In Progress',
    progress: 35,
    health: 'On Track',
  },
  {
    id: 'ac-3',
    title: 'Heavy Press Vibration IoT Sensing Node',
    industry: 'Bharat Forge Digital',
    college: 'XYZ Engineering College',
    studentLead: 'Priya Kulkarni',
    status: 'In Progress',
    progress: 50,
    health: 'On Track',
  },
];

export const sampleWorkspace: CollaborationWorkspace = {
  id: 'collab-101',
  challengeTitle: 'AI Manufacturing Defect Detection',
  industryPartner: 'ABC Technologies',
  academicPartner: 'ABC Engineering College',
  status: 'In Progress',
  progressPercentage: 70,
  milestones: [
    {
      id: 'm1',
      title: 'Requirement Analysis & Optical Spec',
      status: 'completed',
      targetDate: 'Week 1-2',
      deliverable: 'Approved architectural blueprint and lighting/framing specifications.',
    },
    {
      id: 'm2',
      title: 'Multidisciplinary Team Formation',
      status: 'completed',
      targetDate: 'Week 2',
      deliverable: 'Assigned 1 Faculty Mentor, 1 Lead Researcher, and 3 Student Engineers (inc. Vijay Bhosale).',
    },
    {
      id: 'm3',
      title: 'Synthetic & Real-World Dataset Preparation',
      status: 'completed',
      targetDate: 'Week 3-4',
      deliverable: '12,400 annotated high-resolution manufacturing images across 6 flaw categories.',
    },
    {
      id: 'm4',
      title: 'Model Development & Hyperparameter Tuning',
      status: 'in-progress',
      targetDate: 'Week 5-7 (Active)',
      deliverable: 'YOLOv8 nano & MobileNetV3 defect classifier achieving 97.4% mAP.',
    },
    {
      id: 'm5',
      title: 'Hardware Edge Testing & Inference Benchmarking',
      status: 'pending',
      targetDate: 'Week 8-9',
      deliverable: 'Target latency < 35ms per frame on edge Jetson module.',
    },
    {
      id: 'm6',
      title: 'Industrial Pilot Deployment & Final Sign-Off',
      status: 'pending',
      targetDate: 'Week 10',
      deliverable: 'Factory floor pilot verification and joint intellectual property report.',
    },
  ],
  team: [
    { name: 'Dr. Rajesh Nair', role: 'Industry Sponsor & Lead Architect', organization: 'ABC Technologies' },
    { name: 'Dr. S. Patil', role: 'Head of Research & Academic Lead', organization: 'ABC Engineering College' },
    { name: 'Prof. Anjali Mehta', role: 'Faculty Mentor (Computer Vision)', organization: 'ABC Engineering College' },
    { name: 'Vijay Bhosale', role: 'Lead Student ML Engineer', organization: 'Student Team (WCE)' },
    { name: 'Priya Kulkarni', role: 'Student CV Annotation Specialist', organization: 'Student Team (WCE)' },
    { name: 'Rohan Sharma', role: 'Student Edge Deployment Engineer', organization: 'Student Team (WCE)' },
  ],
  updates: [
    {
      id: 'u1',
      author: 'Vijay Bhosale',
      role: 'Lead Student ML Engineer',
      date: 'Today, 11:20 AM',
      message: 'Completed initial epoch training on conveyor scratch dataset. Model reached 97.2% precision on validation split. Starting inference optimization with ONNX runtime.',
    },
    {
      id: 'u2',
      author: 'Prof. Anjali Mehta',
      role: 'Faculty Mentor',
      date: 'Yesterday, 4:45 PM',
      message: 'Verified lighting calibration in the CV Lab test rig. Optical reflection on brushed metal parts has been reduced by 40% with polarizing filter.',
    },
    {
      id: 'u3',
      author: 'Dr. Rajesh Nair',
      role: 'Industry Lead',
      date: '3 days ago',
      message: 'Shared 1,200 additional anomaly samples from assembly line 4. Great progress on Milestone 3 deliverables.',
    },
  ],
};
