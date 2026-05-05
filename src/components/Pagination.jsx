const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const createPageButtons = () => {
    const pages = [];
    for (let page = 1; page <= totalPages; page += 1) {
      if (
        page === 1 ||
        page === totalPages ||
        (page >= currentPage - 1 && page <= currentPage + 1)
      ) {
        pages.push(page);
      } else if (
        page === currentPage - 2 ||
        page === currentPage + 2
      ) {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      {createPageButtons().map((page, index) => (
        <button
          key={`${page}-${index}`}
          type="button"
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : page === '...'
              ? 'cursor-default bg-transparent text-slate-500'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
