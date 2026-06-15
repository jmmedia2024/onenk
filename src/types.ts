export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface Post {
  id: string;
  type: 'notice' | 'news' | 'free' | 'qna' | 'private';
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: Comment[];
}

export interface DonationPledge {
  id: string;
  name: string;
  amount: number;
  type: 'monthly' | 'once';
  paymentMethod: string;
  message: string;
  date: string;
}

export interface DeveloperSnippet {
  title: string;
  filename: string;
  code: string;
  language: 'sql' | 'php';
  description: string;
}

export interface HeroSlide {
  id: number;
  imageUrl: string;
  badge: string;
  title: string;
  subTitle: string;
}

export interface AboutGreeting {
  title: string;
  subTitle: string;
  boldPara: string;
  paras: string[];
  signerOrg: string;
  signerRole: string;
}

export interface AboutPurpose {
  missionTitle: string;
  missionText: string;
  foundingDate: string;
  foundingNotes: string;
  val1Title: string;
  val1Desc: string;
  val2Title: string;
  val2Desc: string;
  val3Title: string;
  val3Desc: string;
  agendas: string[];
}

export interface AboutOrgCustom {
  mainDecisionOrg: string;
  auditorNames: string;
  boardNames: string;
  advisorNames: string;
  presidentName: string;
  secretaryName: string;
  dept1Name: string;
  dept1Desc: string;
  dept2Name: string;
  dept2Desc: string;
  dept3Name: string;
  dept3Desc: string;
  dept4Name: string;
  dept4Desc: string;
}

export interface AboutLocation {
  address: string;
  phone: string;
  email: string;
  subwayLine3: string;
  subwayLine5: string;
  lat: string;
  lng: string;
}

export interface ProjectItem {
  title: string;
  subtitle: string;
  achievements: string[];
  detail: string;
}
