const fallbackCover = '/book-cover-placeholder.svg';

const BookCover = ({ book, className = '' }) => {
  const coverUrl = book?.image || (book?.isbn
    ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(book.isbn)}-L.jpg`
    : fallbackCover);

  return (
    <img
      src={coverUrl}
      alt={`${book?.title || 'Book'} cover`}
      loading="lazy"
      className={className}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = fallbackCover;
      }}
    />
  );
};

export default BookCover;
