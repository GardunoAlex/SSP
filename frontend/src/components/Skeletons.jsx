const ShimmerBlock = ({ className }) => (
  <div className={`shimmer rounded ${className}`} />
);

export const NavSkeleton = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-cream">
    <nav className="container mx-auto px-8 py-4">
      <div className="flex items-center justify-between">
        <ShimmerBlock className="h-8 w-40" />
        <div className="hidden md:flex items-center space-x-6">
          <ShimmerBlock className="h-5 w-16" />
          <ShimmerBlock className="h-5 w-16" />
          <ShimmerBlock className="w-9 h-9 rounded-full" />
        </div>
      </div>
    </nav>
  </header>
);

export const HeroSkeleton = () => (
  <div className="text-center mb-12 space-y-4">
    <ShimmerBlock className="h-10 w-72 mx-auto" />
    <ShimmerBlock className="h-5 w-96 mx-auto" />
  </div>
);

export const DiscoverSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <ShimmerBlock className="h-5 w-3/4" />
        <ShimmerBlock className="h-4 w-full" />
        <ShimmerBlock className="h-4 w-2/3" />
      </div>
    ))}
  </div>
);

export const SavedSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <ShimmerBlock className="h-5 w-3/4" />
        <ShimmerBlock className="h-4 w-full" />
        <ShimmerBlock className="h-4 w-2/3" />
      </div>
    ))}
  </div>
);

export const OrgDashboardSkeleton = () => (
  <div className="space-y-8">
    <ShimmerBlock className="h-8 w-48" />
    <ShimmerBlock className="h-5 w-32" />
    <div className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
      <ShimmerBlock className="h-6 w-40" />
      <ShimmerBlock className="h-4 w-full max-w-md" />
      <ShimmerBlock className="h-4 w-full max-w-sm" />
      <ShimmerBlock className="h-4 w-full max-w-lg" />
    </div>
  </div>
);

export const OpportunityDetailsSkeleton = () => (
  <div className="space-y-6">
    <ShimmerBlock className="h-5 w-16" />
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-8 space-y-5">
      <ShimmerBlock className="h-7 w-2/3" />
      <ShimmerBlock className="h-4 w-full" />
      <ShimmerBlock className="h-4 w-4/5" />
      <ShimmerBlock className="h-4 w-1/2" />
    </div>
  </div>
);

export const OpportunitiesFeedSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <ShimmerBlock className="h-5 w-3/4" />
        <ShimmerBlock className="h-4 w-full" />
        <ShimmerBlock className="h-4 w-2/3" />
      </div>
    ))}
  </div>
);

export const OrgModalSkeleton = () => (
  <div className="space-y-5">
    <ShimmerBlock className="h-6 w-1/2" />
    <ShimmerBlock className="h-4 w-full" />
    <ShimmerBlock className="h-4 w-3/4" />
    <ShimmerBlock className="h-4 w-2/3" />
  </div>
);

export const AdminDashboardSkeleton = () => (
  <div className="space-y-8">
    <ShimmerBlock className="h-8 w-48" />
    <div className="bg-white rounded-lg p-6 space-y-4">
      <ShimmerBlock className="h-5 w-32" />
      <ShimmerBlock className="h-4 w-full" />
      <ShimmerBlock className="h-4 w-full" />
      <ShimmerBlock className="h-4 w-3/4" />
    </div>
    <div className="bg-white rounded-lg p-6 space-y-4">
      <ShimmerBlock className="h-5 w-36" />
      <ShimmerBlock className="h-4 w-full" />
      <ShimmerBlock className="h-4 w-full" />
      <ShimmerBlock className="h-4 w-3/4" />
    </div>
  </div>
);
