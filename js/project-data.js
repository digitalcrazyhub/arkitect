/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * MASTER PROJECT DATA SOURCE (js/project-data.js)
 * Master source of truth for all 15 verified architectural & interior projects.
 * ==============================================================================
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ARTECH_PROJECTS = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return [
    {
      id: '01',
      title: 'Residential Project — Tiruchengode',
      type: 'Residential',
      client: 'Mr. Paranthman',
      location: 'Tiruchengode',
      category: 'Residential Architecture',
      filterCategory: 'residential',
      image: 'assets/images/projects/residential.png',
      alt: 'Exterior architectural view of Residential Project for Mr. Paranthman in Tiruchengode',
      url: 'projects.html',
      featured: true,
      summary: 'Client: Mr. Paranthman \u2022 Location: Tiruchengode \u2022 Type: Residential Architecture'
    },
    {
      id: '02',
      title: 'Residential Interiors — Velachery',
      type: 'Residential Interiors',
      client: 'Mr. Ramadhar Naidu',
      location: 'Phoenix Mall, Velachery, Chennai',
      category: 'Residential Interiors',
      filterCategory: 'residential',
      image: 'assets/images/projects/residential-interiors-1.png',
      alt: 'Residential interior design for Mr. Ramadhar Naidu at Phoenix Mall, Velachery, Chennai',
      url: 'projects.html',
      featured: true,
      summary: 'Client: Mr. Ramadhar Naidu \u2022 Location: Phoenix Mall, Velachery, Chennai \u2022 Type: Residential Interiors'
    },
    {
      id: '03',
      title: 'First Floor Master Bedroom',
      type: 'Residential Interiors',
      client: 'Mr. Parthasarathy',
      location: 'Salem',
      category: 'First Floor Master Bedroom_2',
      filterCategory: 'residential',
      image: 'assets/images/projects/residential-interiors-2.png',
      alt: 'First Floor Master Bedroom residential interior for Mr. Parthasarathy in Salem',
      url: 'projects.html',
      featured: false,
      summary: 'Client: Mr. Parthasarathy \u2022 Location: Salem \u2022 Category: First Floor Master Bedroom_2'
    },
    {
      id: '04',
      title: 'Hospital Single Room — Redhills',
      type: 'Hospital Interiors',
      client: null,
      location: 'Redhills',
      category: 'Fifth Floor Single Room 4',
      filterCategory: 'healthcare',
      image: 'assets/images/projects/hospital-interiors-1.png',
      alt: 'Fifth Floor Single Room hospital interior layout in Redhills',
      url: 'projects.html',
      featured: true,
      summary: 'Location: Redhills \u2022 Type: Hospital Interiors \u2022 Category: Fifth Floor Single Room 4'
    },
    {
      id: '05',
      title: 'Master Suite — Anna Nagar',
      type: 'Residential Interiors',
      client: 'Mr. Kamalakar Reddy',
      location: 'Anna Nagar, Chennai',
      category: 'Master Suite',
      filterCategory: 'residential',
      image: 'assets/images/projects/residential-interiors-3.png',
      alt: 'Master Suite interior design for Mr. Kamalakar Reddy in Anna Nagar, Chennai',
      url: 'projects.html',
      featured: false,
      summary: 'Client: Mr. Kamalakar Reddy \u2022 Location: Anna Nagar, Chennai \u2022 Category: Master Suite'
    },
    {
      id: '06',
      title: 'Dining Room — Anna Nagar',
      type: 'Residential Interiors',
      client: 'Mr. Kamalakar Reddy',
      location: 'Anna Nagar, Chennai',
      category: 'Dining Room',
      filterCategory: 'residential',
      image: 'assets/images/projects/residential-interiors-4.png',
      alt: 'Dining Room interior design for Mr. Kamalakar Reddy in Anna Nagar, Chennai',
      url: 'projects.html',
      featured: false,
      summary: 'Client: Mr. Kamalakar Reddy \u2022 Location: Anna Nagar, Chennai \u2022 Category: Dining Room'
    },
    {
      id: '07',
      title: 'Guest Bedroom — Anna Nagar',
      type: 'Residential Interiors',
      client: 'Mr. Kamalakar Reddy',
      location: 'Anna Nagar, Chennai',
      category: 'Guest Bed Room',
      filterCategory: 'residential',
      image: 'assets/images/projects/residential-interiors-5.png',
      alt: 'Guest Bedroom interior design for Mr. Kamalakar Reddy in Anna Nagar, Chennai',
      url: 'projects.html',
      featured: false,
      summary: 'Client: Mr. Kamalakar Reddy \u2022 Location: Anna Nagar, Chennai \u2022 Category: Guest Bed Room'
    },
    {
      id: '08',
      title: 'Ground Floor Living Room — 01',
      type: 'Residential Interiors',
      client: 'Mr. Parthasarathy',
      location: 'Salem',
      category: 'Ground Floor Living-1',
      filterCategory: 'residential',
      image: 'assets/images/projects/residential-interiors-6.png',
      alt: 'Ground Floor Living Room layout 1 interior for Mr. Parthasarathy in Salem',
      url: 'projects.html',
      featured: false,
      summary: 'Client: Mr. Parthasarathy \u2022 Location: Salem \u2022 Category: Ground Floor Living-1'
    },
    {
      id: '09',
      title: 'Ground Floor Living Room — 02',
      type: 'Residential Interiors',
      client: 'Mr. Parthasarathy',
      location: 'Salem',
      category: 'Ground Floor Living-2',
      filterCategory: 'residential',
      image: 'assets/images/projects/residential-interiors-7.png',
      alt: 'Ground Floor Living Room layout 2 interior for Mr. Parthasarathy in Salem',
      url: 'projects.html',
      featured: false,
      summary: 'Client: Mr. Parthasarathy \u2022 Location: Salem \u2022 Category: Ground Floor Living-2'
    },
    {
      id: '10',
      title: 'First Floor Study Room',
      type: 'Residential Interiors',
      client: 'Mr. Parthasarathy',
      location: 'Salem',
      category: 'First Floor Study Room-1',
      filterCategory: 'residential',
      image: 'assets/images/projects/residential-interiors-8.png',
      alt: 'First Floor Study Room interior for Mr. Parthasarathy in Salem',
      url: 'projects.html',
      featured: false,
      summary: 'Client: Mr. Parthasarathy \u2022 Location: Salem \u2022 Category: First Floor Study Room-1'
    },
    {
      id: '11',
      title: 'Promed Hospital — ICU Ward',
      type: 'Promed Hospital Interiors',
      client: null,
      location: 'ECR',
      category: 'ICU Ward',
      filterCategory: 'healthcare',
      image: 'assets/images/projects/hospital-interiors-2.png',
      alt: 'Promed Hospital ICU Ward clinical interior design on ECR',
      url: 'projects.html',
      featured: true,
      summary: 'Location: ECR \u2022 Type: Promed Hospital Interiors \u2022 Category: ICU Ward'
    },
    {
      id: '12',
      title: 'Promed Hospital — ICU Ward Reception',
      type: 'Promed Hospital Interiors',
      client: null,
      location: 'ECR',
      category: 'ICU Ward Reception',
      filterCategory: 'healthcare',
      image: 'assets/images/projects/hospital-interiors-3.png',
      alt: 'Promed Hospital ICU Ward Reception and nurse station interior on ECR',
      url: 'projects.html',
      featured: false,
      summary: 'Location: ECR \u2022 Type: Promed Hospital Interiors \u2022 Category: ICU Ward Reception'
    },
    {
      id: '13',
      title: 'ACACIA Homess — Apartments',
      type: 'Apartments',
      client: 'ACACIA Homess',
      location: 'Janaki Nagar, Valasaravakkam',
      category: 'Ground Floor Living-2',
      filterCategory: 'apartments',
      image: 'assets/images/projects/apartments.png',
      alt: 'ACACIA Homess apartment residential development in Janaki Nagar, Valasaravakkam',
      url: 'projects.html',
      featured: true,
      summary: 'Client: ACACIA Homess \u2022 Location: Janaki Nagar, Valasaravakkam \u2022 Type: Apartments'
    },
    {
      id: '14',
      title: 'Commercial Building — Nagerkovil',
      type: 'Commercial Building',
      client: 'Mr. Farook',
      location: 'K.P. Road, Nagerkovil',
      category: 'Ground Floor Living-2', // Preserved in raw data per specification
      filterCategory: 'commercial',
      image: 'assets/images/projects/commercial.png',
      alt: 'Commercial building architecture for Mr. Farook on K.P. Road, Nagerkovil',
      url: 'projects.html',
      featured: true,
      summary: 'Client: Mr. Farook \u2022 Location: K.P. Road, Nagerkovil \u2022 Type: Commercial Building'
    },
    {
      id: '15',
      title: 'Promed Hospital — Semi-Private Room',
      type: 'Promed Hospital Interiors',
      client: null,
      location: 'ECR',
      category: 'Semi Private Room',
      filterCategory: 'healthcare',
      image: 'assets/images/projects/hospital-interiors-4.png',
      alt: 'Promed Hospital Semi-Private Room interior on ECR',
      url: 'projects.html',
      featured: false,
      summary: 'Location: ECR \u2022 Type: Promed Hospital Interiors \u2022 Category: Semi Private Room'
    }
  ];
});
