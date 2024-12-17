import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from './jobCard';
import NavSeeker from '../ui/navSeeker.js';
import JobDetails from './JobDetails.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

// Add this function before the JobList component
const formatSalary = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const FilterSection = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-100 last:border-none">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-3 text-left"
      >
        <h3 className="font-medium text-gray-900">{title}</h3>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`space-y-2 overflow-hidden transition-all ${isOpen ? 'pb-3' : 'h-0'}`}>
        {children}
      </div>
    </div>
  );
};

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [datePosted, setDatePosted] = useState('');
  
  const [employmentType, setEmploymentType] = useState({
    'Full-time': false,
    'Part-time': false,
    'Contract': false,
    'Temporary': false,
    'Internship': false
  });
  const [salaryRange, setSalaryRange] = useState({
    'Under 20k': false,
    '20k - 30k': false,
    '30k - 50k': false,
    'Custom': false
  });
  const [industry, setIndustry] = useState({
    'Healthcare': false,
    'Education': false,
    'Engineering': false,
    'Retail': false,
    'Entertainment': false,
    'Logistics': false,
    'Technology': false,
    'Other': false
  });
  const [disabilityType, setDisabilityType] = useState({
    'All Disabilities': false,
    'Low Vision': false,
    'Hemophilia': false,
    'Epilepsy': false,
    'Mobility Disability': false,
    'Hearing Impairment': false,
    'Other': false
  });
  const [workSetup, setWorkSetup] = useState({
    'On-site': false,
    'Remote': false,
    'Hybrid': false
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFilters, setOpenFilters] = useState({
    datePosted: true,  // Keep the most important ones open by default
    employmentType: true,
    salaryRange: false,
    industry: false,
    disabilityType: false,
    workSetup: false
  });
  const [customSalaryRange, setCustomSalaryRange] = useState({
    min: 15000,  // Starting from minimum wage
    max: 150000  // Reasonable maximum for initial state
  });
  const [showCustomRange, setShowCustomRange] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs/jobseeker/all', {
          params: {
            status: 'active'
          }
        });
        const activeJobs = response.data.data.filter(job => 
          job.jobStatus === 'active' && 
          job.isActive === true
        );
        setJobs(activeJobs);
        setFilteredJobs(activeJobs);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch jobs. Please try again later.');
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearchTitle(location.state.searchQuery);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search filters
    if (searchTitle.trim()) {
      filtered = filtered.filter(job =>
        job.jobTitle.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    if (searchLocation.trim()) {
      filtered = filtered.filter(job =>
        job.jobLocation.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    // Date Posted filter
    if (datePosted) {
      const now = new Date();
      const filterDate = new Date();
      
      switch(datePosted) {
        case '24h':
          filterDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          filterDate.setDate(now.getDate() - 30);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(job => 
        new Date(job.createdAt) >= filterDate
      );
    }

   // Employment Type filter
   const selectedEmploymentTypes = Object.entries(employmentType)
   .filter(([_, isSelected]) => isSelected)
   .map(([type]) => type);
 if (selectedEmploymentTypes.length > 0) {
   filtered = filtered.filter(job => 
     selectedEmploymentTypes.includes(job.employmentType)
   );
 }


    // Salary Range filter with improved custom range handling
    const selectedSalaryRanges = Object.entries(salaryRange)
      .filter(([_, isSelected]) => isSelected)
      .map(([range]) => range);
  
    if (selectedSalaryRanges.length > 0) {
      filtered = filtered.filter(job => {
        return selectedSalaryRanges.some(range => {
          const jobMinSalary = job.salaryMin || 0;
          const jobMaxSalary = job.salaryMax || 0;

          switch(range) {
            case 'Under 20k':
              return jobMaxSalary < 20000;
            case '20k - 30k':
              return jobMaxSalary >= 20000 && jobMinSalary <= 30000;
            case '30k - 50k':
              return jobMaxSalary >= 30000 && jobMinSalary <= 50000;
            case 'Custom':
              // Check if salary ranges overlap
              return (
                (jobMinSalary >= customSalaryRange.min && jobMinSalary <= customSalaryRange.max) || // Job min salary falls within range
                (jobMaxSalary >= customSalaryRange.min && jobMaxSalary <= customSalaryRange.max) || // Job max salary falls within range
                (jobMinSalary <= customSalaryRange.min && jobMaxSalary >= customSalaryRange.max)    // Job range encompasses custom range
              );
            default:
              return false;
          }
        });
      });
    }

    // Industry filter
    const selectedIndustries = Object.entries(industry)
      .filter(([_, isSelected]) => isSelected)
      .map(([type]) => type);
    if (selectedIndustries.length > 0) {
      filtered = filtered.filter(job => 
        job.industry.some(ind => selectedIndustries.includes(ind))
      );
    }

    // Disability Type filter
  const selectedDisabilities = Object.entries(disabilityType)
  .filter(([_, isSelected]) => isSelected)
  .map(([type]) => type);

if (selectedDisabilities.length > 0 && !selectedDisabilities.includes('All Disabilities')) {
  filtered = filtered.filter(job => 
    job.disabilityTypes && 
    job.disabilityTypes.length > 0 && 
    job.disabilityTypes.some(type => selectedDisabilities.includes(type))
  );
}
     // Work Setup filter
  const selectedWorkSetups = Object.entries(workSetup)
  .filter(([_, isSelected]) => isSelected)
  .map(([type]) => type);

if (selectedWorkSetups.length > 0) {
  filtered = filtered.filter(job => 
    job.workSetup && selectedWorkSetups.includes(job.workSetup)
  );
}

    // Apply sorting
    filtered = sortJobs(filtered, sortBy);

    setFilteredJobs(filtered);
  };

  // Apply filters whenever any filter changes
  useEffect(() => {
    if (jobs.length > 0) {
      applyFilters();
    }
  }, [
    jobs,
    searchTitle,
    searchLocation,
    datePosted,
    employmentType, 
    salaryRange,
    industry,
    disabilityType,
    workSetup,
    sortBy,
    customSalaryRange
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTitle('');
    setSearchLocation('');
    setDatePosted('');
    setEmploymentType(Object.fromEntries(Object.keys(employmentType).map(key => [key, false])));
    setSalaryRange(Object.fromEntries(Object.keys(salaryRange).map(key => [key, false])));
    setIndustry(Object.fromEntries(Object.keys(industry).map(key => [key, false])));
    setDisabilityType(Object.fromEntries(Object.keys(disabilityType).map(key => [key, false])));
    setWorkSetup(Object.fromEntries(Object.keys(workSetup).map(key => [key, false])));
    setSortBy('newest');
  };

  // Add a search handler for immediate search
  const handleSearch = () => {
    applyFilters();
  };

  const handleOpenDetails = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const handleApply = (job) => {
    navigate(`/jobs/${job._id}/apply`, {
      state: {
        jobId: job._id,
        jobTitle: job.jobTitle,
        company: job.company,
        jobDescription: job.jobDescription
      }
    });
  };

  // Add sorting function
  const sortJobs = (jobs, sortType) => {
    const sortedJobs = [...jobs];
    switch (sortType) {
      case 'newest':
        return sortedJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sortedJobs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'salary-high':
        return sortedJobs.sort((a, b) => b.salaryMax - a.salaryMax);
      case 'salary-low':
        return sortedJobs.sort((a, b) => a.salaryMin - b.salaryMin);
      default:
        return sortedJobs;
    }
  };

  // Add sort menu component
  const SortMenu = () => (
    <div className="relative">
      <button 
        onClick={() => setShowSortMenu(!showSortMenu)}
        className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50"
      >
        <span>Sort By: {sortBy.replace('-', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}</span>
        <ChevronDown size={16} />
      </button>

      {showSortMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-10">
          <div className="py-1">
            <button
              onClick={() => {
                setSortBy('newest');
                setShowSortMenu(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Newest First
            </button>
            <button
              onClick={() => {
                setSortBy('oldest');
                setShowSortMenu(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Oldest First
            </button>
            <button
              onClick={() => {
                setSortBy('salary-high');
                setShowSortMenu(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Highest Salary
            </button>
            <button
              onClick={() => {
                setSortBy('salary-low');
                setShowSortMenu(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Lowest Salary
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const toggleFilter = (filterName) => {
    setOpenFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 font-poppins">
      <NavSeeker />
      
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-10 bg-red-50 mx-4 lg:mx-8 mt-8 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="p-4 lg:p-8">
          {/* Header section */}
          <div className="mb-8 bg-white rounded-xl p-4 lg:p-8">
            <h1 className="text-2xl lg:text-4xl font-bold mb-2">
              Welcome Back, Let's Find Your <span className="text-blue-500">Job</span>!
            </h1>
            <p className="text-gray-600 mb-6">
              Let's explore opportunities that match your skills and aspirations!
            </p>
            
            <div className="flex flex-col lg:flex-row gap-4">
              <input
                type="text"
                placeholder="Search job title or keyword"
                className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Location"
                className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
              <button 
                onClick={handleSearch}
                className="bg-blue-500 text-white px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Filter Toggle for Mobile */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full bg-white p-3 rounded-xl text-left flex justify-between items-center"
            >
              <span className="font-medium">Filters</span>
              <ChevronDown className={`transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
            {/* Filters Panel */}
            <div className={`lg:col-span-3 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-xl p-4 lg:p-6 lg:sticky lg:top-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    onClick={clearAllFilters}
                    className="text-red-500 text-sm hover:text-red-600"
                  >
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  <FilterSection 
                    title="Date Posted" 
                    isOpen={openFilters.datePosted}
                    onToggle={() => toggleFilter('datePosted')}
                  >
                    <select
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-sm"
                      value={datePosted}
                      onChange={(e) => setDatePosted(e.target.value)}
                    >
                      <option value="">Anytime</option>
                      <option value="24h">Past 24 hours</option>
                      <option value="7d">Past week</option>
                      <option value="30d">Past month</option>
                    </select>
                  </FilterSection>

                  <FilterSection 
                    title="Employment Type" 
                    isOpen={openFilters.employmentType}
                    onToggle={() => toggleFilter('employmentType')}
                  >
                    <div className="space-y-2">
                      {Object.keys(employmentType).map(type => (
                        <label key={type} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={employmentType[type]}
                            onChange={() => setEmploymentType({...employmentType, [type]: !employmentType[type]})}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                          />
                          <span className="text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>

                  <FilterSection 
                    title="Salary Range" 
                    isOpen={openFilters.salaryRange}
                    onToggle={() => toggleFilter('salaryRange')}
                  >
                    <div className="space-y-3">
                      {Object.keys(salaryRange).map(range => (
                        <label key={range} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={salaryRange[range]}
                            onChange={() => {
                              const newValue = !salaryRange[range];
                              setSalaryRange(prev => ({
                                ...prev,
                                [range]: newValue
                              }));
                              if (range === 'Custom' && !newValue) {
                                setCustomSalaryRange({
                                  min: 15000,
                                  max: 150000
                                });
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                          />
                          <span className="text-gray-700">{range}</span>
                        </label>
                      ))}

                      {/* Custom Range Slider - Updated version */}
                      {salaryRange['Custom'] && (
                        <div className="pt-2 space-y-4">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{formatSalary(customSalaryRange.min)}</span>
                            <span>{formatSalary(customSalaryRange.max)}</span>
                          </div>
                          
                          <div className="relative h-2 mt-8 mb-6">
                            <div className="absolute w-full h-2 bg-gray-200 rounded-full">
                              <div
                                className="absolute h-2 bg-blue-500 rounded-full"
                                style={{
                                  left: `${(customSalaryRange.min / 150000) * 100}%`,
                                  right: `${100 - (customSalaryRange.max / 150000) * 100}%`
                                }}
                              />
                            </div>
                            
                            {/* Slider thumbs */}
                            <div 
                              className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-pointer shadow-md"
                              style={{ 
                                left: `calc(${(customSalaryRange.min / 150000) * 100}% - 8px)`,
                                top: '-6px',
                                zIndex: 3
                              }}
                              onMouseDown={(e) => {
                                const startX = e.pageX;
                                const startMin = customSalaryRange.min;
                                
                                const handleMouseMove = (moveEvent) => {
                                  const delta = moveEvent.pageX - startX;
                                  const containerWidth = e.target.parentElement.offsetWidth;
                                  const newMin = Math.max(
                                    15000,
                                    Math.min(
                                      customSalaryRange.max - 10000,
                                      startMin + (delta / containerWidth) * 150000
                                    )
                                  );
                                  
                                  setCustomSalaryRange(prev => ({
                                    ...prev,
                                    min: Math.round(newMin / 1000) * 1000
                                  }));
                                };
                                
                                const handleMouseUp = () => {
                                  document.removeEventListener('mousemove', handleMouseMove);
                                  document.removeEventListener('mouseup', handleMouseUp);
                                };
                                
                                document.addEventListener('mousemove', handleMouseMove);
                                document.addEventListener('mouseup', handleMouseUp);
                              }}
                            />
                            
                            <div 
                              className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-pointer shadow-md"
                              style={{ 
                                left: `calc(${(customSalaryRange.max / 150000) * 100}% - 8px)`,
                                top: '-6px',
                                zIndex: 3
                              }}
                              onMouseDown={(e) => {
                                const startX = e.pageX;
                                const startMax = customSalaryRange.max;
                                
                                const handleMouseMove = (moveEvent) => {
                                  const delta = moveEvent.pageX - startX;
                                  const containerWidth = e.target.parentElement.offsetWidth;
                                  const newMax = Math.min(
                                    150000,
                                    Math.max(
                                      customSalaryRange.min + 10000,
                                      startMax + (delta / containerWidth) * 150000
                                    )
                                  );
                                  
                                  setCustomSalaryRange(prev => ({
                                    ...prev,
                                    max: Math.round(newMax / 1000) * 1000
                                  }));
                                };
                                
                                const handleMouseUp = () => {
                                  document.removeEventListener('mousemove', handleMouseMove);
                                  document.removeEventListener('mouseup', handleMouseUp);
                                };
                                
                                document.addEventListener('mousemove', handleMouseMove);
                                document.addEventListener('mouseup', handleMouseUp);
                              }}
                            />
                            
                            {/* Hidden range inputs for accessibility */}
                            <input
                              type="range"
                              min="15000"
                              max="150000"
                              step="1000"
                              value={customSalaryRange.min}
                              onChange={(e) => {
                                const value = Math.min(Number(e.target.value), customSalaryRange.max - 10000);
                                setCustomSalaryRange(prev => ({
                                  ...prev,
                                  min: value
                                }));
                              }}
                              className="sr-only"
                              aria-label="Minimum salary"
                            />
                            
                            <input
                              type="range"
                              min="15000"
                              max="150000"
                              step="1000"
                              value={customSalaryRange.max}
                              onChange={(e) => {
                                const value = Math.max(Number(e.target.value), customSalaryRange.min + 10000);
                                setCustomSalaryRange(prev => ({
                                  ...prev,
                                  max: value
                                }));
                              }}
                              className="sr-only"
                              aria-label="Maximum salary"
                            />
                          </div>

                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-sm text-gray-600 mb-1">Min Salary</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                                <input
                                  type="number"
                                  value={customSalaryRange.min}
                                  onChange={(e) => {
                                    const value = Math.min(Math.max(15000, Number(e.target.value)), customSalaryRange.max - 10000);
                                    setCustomSalaryRange(prev => ({
                                      ...prev,
                                      min: value
                                    }));
                                  }}
                                  className="w-full pl-8 p-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm text-gray-600 mb-1">Max Salary</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                                <input
                                  type="number"
                                  value={customSalaryRange.max}
                                  onChange={(e) => {
                                    const value = Math.max(Math.min(150000, Number(e.target.value)), customSalaryRange.min + 10000);
                                    setCustomSalaryRange(prev => ({
                                      ...prev,
                                      max: value
                                    }));
                                  }}
                                  className="w-full pl-8 p-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </FilterSection>

                  <FilterSection 
                    title="Industry" 
                    isOpen={openFilters.industry}
                    onToggle={() => toggleFilter('industry')}
                  >
                    <div className="space-y-2">
                      {Object.keys(industry).map(type => (
                        <label key={type} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={industry[type]}
                            onChange={() => setIndustry({...industry, [type]: !industry[type]})}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                          />
                          <span className="text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>

                  <FilterSection 
                    title="Disability Type" 
                    isOpen={openFilters.disabilityType}
                    onToggle={() => toggleFilter('disabilityType')}
                  >
                    <div className="space-y-2">
                      {Object.keys(disabilityType).map(type => (
                        <label key={type} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={disabilityType[type]}
                            onChange={() => setDisabilityType({...disabilityType, [type]: !disabilityType[type]})}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                          />
                          <span className="text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>

                  <FilterSection 
                    title="Work Setup" 
                    isOpen={openFilters.workSetup}
                    onToggle={() => toggleFilter('workSetup')}
                  >
                    <div className="space-y-2">
                      {Object.keys(workSetup).map(type => (
                        <label key={type} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={workSetup[type]}
                            onChange={() => setWorkSetup({...workSetup, [type]: !workSetup[type]})}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                          />
                          <span className="text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>
                </div>
              </div>
            </div>

            {/* Job Listings */}
            <div className="lg:col-span-9">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
                <p className="text-gray-600">{filteredJobs.length} Jobs results</p>
                <SortMenu />
              </div>

              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onOpenDetails={handleOpenDetails}
                  />
                ))}
              </div>

              {filteredJobs.length === 0 && (
                <div className="text-center text-gray-500 mt-8 bg-white rounded-xl p-4 lg:p-8">
                  <p>No jobs match your search criteria.</p>
                </div>
              )}
            </div>
          </div>

          <JobDetails
            job={selectedJob}
            isOpen={isModalOpen}
            onClose={handleCloseDetails}
            onApply={handleApply}
          />
        </div>
      )}
    </div>
  );
};

export default JobList;