﻿/* Change this file to get your personal Portfolio */

// Your Summary And Greeting Section

import emoji from "react-easy-emoji";

const greeting = {
  /* Your Summary And Greeting Section */
  username: "Saurav Kanchan",
  title: "Hi all, I'm Saurav",
  subTitle: emoji("A passionate blockchain developer from india. Most of my research effort is focused on improving ÐApp experience. " +
    "Currently working in Arcana Networks"),
  resumeLink: "https://drive.google.com/file/d/1crV93LiTPor5ZirR7uTF-hQ1WkMRk4Da/view?usp=sharing"
};

// Your Social Media Link

const socialMediaLinks = {

  github: "https://github.com/SauravKanchan",
  linkedin: "https://www.linkedin.com/in/sauravkanchan/",
  gmail: "sauravnk300@gmail.com",
  // facebook: "https://www.facebook.com/saurav.kanchan/",
  medium: "https://medium.com/@sauravnk30",
  // Instagram and Twitter are also supported in the links!
  twitter: "https://twitter.com/sauravnk30"
};

// Your Skills Section

const skillsSection = {
  title: "What I do",
  subTitle: "Blockchain and backend developer who likes to explore new tech",
  skills: [
    emoji("⚡ Smart Contracts"),
    emoji("⚡ Cryptography"),
    emoji("⚡ Ngnix, Gunicorn"),
    emoji("⚡ Automation"),
  ],

  /* Make Sure You include correct Font Awesome Classname to view your icon
  https://fontawesome.com/icons?d=gallery */

  softwareSkills: [
    {
      skillName: "Ethereum",
      fontAwesomeClassname: "fab fa-ethereum"
    },
    {
      skillName: "python",
      fontAwesomeClassname: "fab fa-python"
    },
    {
      skillName: "django"
    },
    {
      skillName: "nodejs",
      fontAwesomeClassname: "fab fa-node"
    },
    {
      skillName: "aws",
      fontAwesomeClassname: "fab fa-aws"
    },
    {
      skillName: "truffle"
    },
    {
      skillName: "svelte"
    },
    {
      skillName: "EthersJs",
      fontAwesomeClassname: "fab fa-ethereum"
    },
    {
      skillName: "Nginx"
    }

  ]
};

// Your top 3 proficient stacks/tech experience

const techStack = {
  viewSkillBars: false, //Set it to true to show Proficiency Section
  experience: [
    {
      Stack: "Frontend/Design",  //Insert stack or technology you have experience in
      progressPercentage: "90%"  //Insert relative proficiency in percentage
    },
    {
      Stack: "Backend",
      progressPercentage: "70%"
    },
    {
      Stack: "Programming",
      progressPercentage: "60%"
    }
  ]
};


// Your top 3 work experiences

const workExperiences = {
  viewExperiences: true, //Set it to true to show workExperiences Section
  experience: [
    {
      role: "Blockchain Developer",
      company: "Arcana",
      companylogo: require("./assets/images/arcana-white-logo.png"),
      date: "October 2019 – Present",
      desc: "",
      descBullets: [
        "Design and implement smart contracts for the company",
        "Build a back-end server that handles meta transactions and powers the dashboard",
        "Design and implement access control and storage of arcana network",
        "Protocol development"
      ]
    },
    {
      role: "Blockchain Developer",
      company: "Blocklogy",
      companylogo: require("./assets/images/blocklogy.jpg"),
      date: "April 2019 – May 2019",
      descBullets: [
        "Built eraswap.life which is a gateway to eraswap ecosystem",
        "Worked on backend of dayswappers.com which is referral and affiliate program of Era Swap Ecosystem."
      ]
    },
    {
      role: "Computer Vision Intern",
      company: "Mahindra Susten",
      companylogo: require("./assets/images/susten-logo.png"),
      date: "Jan 2019 – Feb 2019",
      desc: "Photovoltaic cells crack detection using Computer Vision.\nTech stack used:",
      descBullets: [
        "Python",
        "OpenCv",
        "Docx"
      ]
    },
  ]
};

/* Your Open Source Section to View Your Github Pinned Projects
To know how to get github key look at readme.md */

const openSource = {
  githubConvertedToken: process.env.REACT_APP_GITHUB_TOKEN,
  githubUserName: "SauravKanchan", // Change to your github username to view your profile in Contact Section.
  showGithubProfile: "true" // Set true or false to show Contact profile using Github, defaults to false
};


// Some Big Projects You have worked with your company

const bigProjects = {
  title: "Big Projects",
  subtitle: "SOME STARTUPS AND COMPANIES THAT I HELPED TO CREATE THEIR TECH",
  projects: [
    {
      image: require("./assets/images/arcana-old.png"),
      link: "https://github.com/arcana-network/smart-contract"
    },
    {
      image: require("./assets/images/eraswaplife.png"),
      link: "https://eraswap.life/"
    },
    {
      image: require("./assets/images/dayswappers.png"),
      link: "https://dayswappers.com/"
    },
    {
      image: require("./assets/images/khelomore.png"),
      link: "https://pnp.khelomore.com/"
    }
  ]
};

// Your Achievement Section Include Your Certification Talks and More

const achievementSection = {

  title: emoji("Achievements And Certifications 🏆 "),
  subtitle: "Achievements, Certifications, Award Letters and Some Cool Stuff that I have done !",

  achivementsCards: [
    {
      title: "Hackathons Won",
      subtitle: "",
      image: require("./assets/images/hackathon.gif"),
      descBullets: [
        "2nd Prize for LI.FI protocol in EthIndia 2022 and various sponsor prizes",
        "BitCamp 2018, CSI RAIT",
        "ByteCamp 2018, SIES",
        "FR. CRIT Hackathon 2018",
        "Mumbai Hackathon 2018(2n runner up)"
      ],
      footerLink: [
        // {
        //   name: "Certification",
        //   url: "https://drive.google.com/file/d/0B7kazrtMwm5dYkVvNjdNWjNybWJrbndFSHpNY2NFV1p4YmU0/view?usp=sharing"
        // },
        // {
        //   name: "Award Letter",
        //   url: "https://drive.google.com/file/d/0B7kazrtMwm5dekxBTW5hQkg2WXUyR3QzQmR0VERiLXlGRVdF/view?usp=sharing"
        // },
        // {name: "Google Code-in Blog", url: "https://opensource.googleblog.com/2019/01/google-code-in-2018-winners.html"}
      ]
    },
    {
      title: "Research Papers",
      subtitle: "",
      image: require("./assets/images/research.gif"),
      descBullets: [
        "[1] Public Key Searchable Encryption Using Elliptic Curve Diffie-Hellman Cryptography",
        "[2] Novel Approaches to Text Steganography",
        "[3] Photovoltaic Cell Defect Detection in Solar Panel"
      ],
      footerLink: [
        {
          name: "Research [1]",
          url: "https://search.proquest.com/openview/c33191ce44fd7ab76fec7ba08a653848/1?pq-origsite=gscholar&cbl=2029987"
        },
        {
          name: "Research [2]",
          url: "https://www.academia.edu/42015328/Novel_Approaches_to_Text_Steganography?coauthor_invite=e85c2e0d5f38a0cd6f8c3f7c49f44b0e&src=view_btn"
        },
        {
          name: "Research [3]",
          url: "https://digitalxplore.org/pps.php?pd_id=6934"
        }
      ]
    },

    {
      title: "Certfications",
      subtitle: "",
      image: require("./assets/images/ibm.png"),
      descBullets: [
        "IBM Blockchain Essentials",
        "IBM Blockchain Foundation Developer"
      ],
      footerLink: [
        {name: "Essentials", url: "https://courses.cognitiveclass.ai/certificates/53b82d96041b4399801af075ec2ff813"},
        {
          name: "Foundation Developer",
          url: "https://courses.cognitiveclass.ai/certificates/ee212efde2834dd8a4f6ada799ccfc3a"
        }
      ]
    }
  ]
};

// Blogs Section

const blogSection = {

  title: "Blogs",
  subtitle: "With Love for Developing cool stuff, I love to write and teach others what I have learnt.",

  blogs: [
    {
      url: "https://www.arcana.network/blog/web3-entry-barriers-with-meta-transactions",
      title: "Breaking Web3 Entry Barriers with Meta Transactions",
      description: "A Meta-Transaction refers to a method where a user signs and submits a transaction without incurring any gas fees."
    },
    {
      url: "https://medium.com/@sauravnk30/anonymous-web-authentication-4d41b2c26bee",
      title: "Anonymous web authentication",
      description: "A modern approach to authenticate users without email and password. This blog discuss the problem " +
        "with current implementation and it's solution"
    },
    {
      url: "https://medium.com/coinmonks/compiling-deploying-and-interacting-with-smart-contract-using-javascript-641cf0342824",
      title: "Compiling, Deploying and Interacting with Smart Contract using JavaScript",
      description: "Instead of using truffle you can also compile, deploy and interact with smart contracts using ethersjs with ease"
    },
    {
      url: "https://dev.to/sauravkanchan/svelte-bootstrap-with-material-design-1j99",
      title: "Svelte Bootstrap with Material Design",
      description: "This project is based on the latest Bootstrap 4 and Svelte 3. Absolutely no jQuery. It is inspired by mdbreact. This blog post will be about how to install it and use it."
    }
  ]
};

// Talks Sections

const talkSection = {
  title: "TALKS",
  subtitle: emoji("I LOVE TO SHARE MY LIMITED KNOWLEDGE AND GET A SPEAKER BADGE 😅"),

  talks: [
    {
      title: "How to begin your web3 developer journey?",
      subtitle: "TPH's builderseries: part 8",
      event_url: "https://twitter.com/0xTPH/status/1560246399102754816"
    },
    {
      title: "Shamir's Secret Sharing",
      subtitle: "Cryptographic algorithm to share secrete",
      event_url: "https://twitter.com/ArcanaNetwork/status/1464150537901801474"
    }, 
    {
      title: "Breaking into Blockchain",
      subtitle: "Practical workshop on the fundamentals of Blockchain technology.",
      event_url: "https://twitter.com/0xTPH/status/1560246399102754816"
    },
    {
      title: "Faculty development program in UMIT",
      subtitle: "Training program focused on the Blockchain technology",
      event_url: "https://www.picuki.com/media/2068816140826916633"
    },
    {
      title: "Automate the boring stuffs with python",
      subtitle: "Workshop conducted by ISTE RAIT",
      event_url: "https://www.facebook.com/isteraitofficial/photos/a.2047088395524310/2510579635841848/?type=3"
    }
  ]
};

// Podcast Section

const podcastSection = {
  title: emoji("Podcast 🎙️"),
  subtitle: "I LOVE TO TALK ABOUT MYSELF AND TECHNOLOGY",
  // Please Provide with Your Podcast embeded Link
  podcast: ["https://anchor.fm/codevcast/embed/episodes/DevStory---Saad-Pasta-from-Karachi--Pakistan-e9givv/a-a15itvo"]
};

const contactInfo = {
  title: emoji("Contact Me ☎️"),
  subtitle: "Discuss a project or just want to say hi? My Inbox is open for all.",
  number: "+91-9594464390",
  email_address: "sauravnk30@gmail.com"
};

//Twitter Section

const twitterDetails = {

  userName: "sauravnk30"//Replace "twitter" with your twitter username without @

};
export {
  greeting,
  socialMediaLinks,
  skillsSection,
  techStack,
  workExperiences,
  openSource,
  bigProjects,
  achievementSection,
  blogSection,
  talkSection,
  podcastSection,
  contactInfo,
  twitterDetails
};
