import { CaseStudy } from '@/types/case-study';

interface CaseStudyTemplateProps {
  caseStudy: CaseStudy;
}

export function CaseStudyTemplate({ caseStudy }: CaseStudyTemplateProps) {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      <h1 className="text-4xl font-bold mb-8">{caseStudy.formData.projectName}</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Client:</strong> {caseStudy.formData.clientName}
          </div>
          <div>
            <strong>Industry:</strong> {caseStudy.formData.industry}
          </div>
          <div>
            <strong>Duration:</strong> {caseStudy.formData.startDate} - {caseStudy.formData.endDate}
          </div>
          <div>
            <strong>Company Size:</strong> {caseStudy.formData.companySize}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Initial Situation</h2>
        <p className="text-gray-700">{caseStudy.formData.initialSituation}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Objectives</h2>
        <ul className="list-disc list-inside space-y-2">
          {caseStudy.formData.objectives.map((objective, index) => (
            <li key={index} className="text-gray-700">{objective}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Strategic Approach</h2>
        <p className="text-gray-700">{caseStudy.formData.strategicApproach}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caseStudy.formData.successMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold">{metric.metric}</h3>
              <p className="text-2xl font-bold text-green-600">{metric.value}</p>
              <p className="text-sm text-gray-600">{metric.improvement}</p>
            </div>
          ))}
        </div>
      </section>

      {caseStudy.formData.testimonials.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Testimonials</h2>
          {caseStudy.formData.testimonials.map((testimonial, index) => (
            <blockquote key={index} className="border-l-4 border-blue-500 pl-4 italic mb-4">
              <p className="text-gray-700 mb-2">"{testimonial.quote}"</p>
              <cite className="text-sm text-gray-600">
                — {testimonial.author}, {testimonial.role}
              </cite>
            </blockquote>
          ))}
        </section>
      )}
    </div>
  );
}