import { Clock, ArrowRight } from 'lucide-react';
import type { Blog } from '../lib/types';
import { accentClasses } from '../lib/utils';
import { categoryIcon } from '../lib/icons';
import { routeToHash } from '../lib/router';

export function BlogCard({ blog, index = 0 }: { blog: Blog; index?: number }) {
  const a = accentClasses(blog.accent);
  const Icon = blog.category ? categoryIcon(blog.category.icon) : null;

  return (
    <a
      href={routeToHash({ name: 'blog', slug: blog.slug })}
      className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(16,23,70,0.25)]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={`relative h-32 bg-gradient-to-br ${a.gradient}`}>
        <div className="absolute inset-0 bg-bubble-fade opacity-60" />
        {Icon && (
          <Icon
            className="absolute right-4 top-4 h-10 w-10 text-white/90 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
            strokeWidth={2.2}
          />
        )}
        {blog.featured && (
          <span className="absolute left-4 top-4 chip bg-white/90 text-navy-900 shadow-soft">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {blog.category && (
          <span
            className={`chip ${a.bgSoft} ${a.text} mb-3 self-start`}
          >
            {blog.category.name}
          </span>
        )}
        <h3 className="text-lg font-extrabold leading-snug text-navy-900 group-hover:text-navy-700">
          {blog.title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-navy-600 line-clamp-3">
          {blog.summary}
        </p>

        <div className="mt-4 flex items-center justify-between text-xs font-bold text-navy-500">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {blog.read_minutes} min read
          </span>
          <span
            className={`flex items-center gap-1 ${a.text} transition-transform group-hover:translate-x-1`}
          >
            Read
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
}
