export interface Course {
    id: string;
    title: string;
    instructor: string;
    instructorIcon: string;
    rating: number;
    reviews: number;
    price: number;
    originalPrice: number;
    image: string;
    tag: string | null;
    tagType: 'primary' | 'secondary' | 'glass' | null;
}

export const courses: Course[] = [
    {
        id: 'organic-chem',
        title: 'Mastering Organic Chemistry: Mechanisms and Synthesis',
        instructor: 'Dr. Sarah Jenkins, PhD',
        instructorIcon: 'person',
        rating: 4.9,
        reviews: 12402,
        price: 84.99,
        originalPrice: 129.99,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDR6DGwRE1YJ8WF-DD9FAmqasKkQiz7jq169wj28XZtFmFgaxZDad34mUCAOIaE4gQ5FIqFC71LRMZqR2Bi4CmVOJyECsvY1r83JLr_vSWmFaj8UMKYEiW0SHd79WThs0nGeo6BPC8nLonaTVeOML5vp7jLMhsE9J6eAN-RJhJWxOoNVKSr_LYdSQxV0wNOlnnHa56RpMQRvfL2fCh4wYz2v9ex0_t8T7U4bcsBwD9bFbLjZbSCbhJ0BZnYiXmwb_o3CRYd5ZnjqjDp',
        tag: 'Bestseller',
        tagType: 'primary'
    },
    {
        id: 'quantum-chem',
        title: 'Computational Quantum Chemistry: From Zero to Pro',
        instructor: 'Prof. Marcus Thorne',
        instructorIcon: 'person',
        rating: 4.7,
        reviews: 2145,
        price: 49.99,
        originalPrice: 89.99,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXGPsGjhvyb2xdQUvZcqfCrqxxhFdh4b4Y0V1_00an6eiDTzwbhwd2p2F8cddtH-mGAEAOW1zOb-c3j6Uzh-Dtc1960cU_ebO-RQiGd25J0DVvjiYAihvLgU9mKkJk20jtGPEVHTR-lIXops4jtY8CozvMiSbzFzBlpPCFiJ-Yuratx_qRVAZT7N3sYTu0Q2_8wjr4JLjhRwmzzoRHBHDX2xQHvPSQSs64ZerajbV1mYRcqXqCEOcNqtS5-yQYFpCbPbgqJMsQIF2Y',
        tag: 'New',
        tagType: 'glass'
    },
    {
        id: 'analytical',
        title: 'Advanced Analytical Methods: HPLC & Mass Spec',
        instructor: 'Dr. Elena Rodriguez',
        instructorIcon: 'person',
        rating: 4.8,
        reviews: 876,
        price: 19.99,
        originalPrice: 149.99,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCF0L1ijMQahBCWN2zirANGanT9CkAlXTekAmgR8vLd4d72nZ8cP_re_VxwLPNzRZGZ0phlBPL8Ke_LAdEq_grZl6lawFs2Fe5wlhN2C-DU-uU8lRr-hHWL6FIWkYaxyNRKCEkO00V0fqUyEkhcTF3nP82yfCrqO2R6-K3VvGwm-BzoNhSmd_rIdPjr0Zs4fbk9-Rmn6pcfelhtLxf0xwa6b4eg1og4DrKlt3fsIgvNNKAMh6t2eVUIye7gkBT6FMHe6iCooSAN5TV_',
        tag: 'Top Rated',
        tagType: 'secondary'
    },
    {
        id: 'lab-tech',
        title: 'Essential Laboratory Techniques for Researchers',
        instructor: 'Technical Univ. of Berlin',
        instructorIcon: 'school',
        rating: 4.6,
        reviews: 5532,
        price: 34.99,
        originalPrice: 54.99,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApiDI_MSm9JzKWMsC-ogeVV8jnBTFjmuKt4KmnOgjUm1flqwVvujZdROILpvoK9fgXCr53alZdswcZmeu6frUrrD1K9IlKQYbkvdyx2iw65s4hCNn4gfi3KqX6pxx0-NGCxBIfaLPqpbNHK12Em0rmAajG8CQEEwZl-s_JbzZMDm8ebQU5VJf7jqAq7myHG4If3SX49tFL_esJklegzayp1b14Qy4KTyWvCJKsKtmqN-eVIBexHsEzL2nsjl7IvbczDJH1XIltv1VA',
        tag: null,
        tagType: null
    }
];

export const categories: string[] = [
    'General Chemistry',
    'Organic Synthesis',
    'Biochemistry',
    'Analytical',
    'Engineering',
    'Lab Safety',
    'Physical Chem',
    'Pharmacology'
];

export const trustedLogos = [
    { icon: 'biotech', text: 'OXFORD LABS' },
    { icon: 'genetics', text: 'GENE-TECH' },
    { icon: 'grid_view', text: 'NANO-SCIENCE' },
    { icon: 'hub', text: 'MOLECULAR.AI' }
];
