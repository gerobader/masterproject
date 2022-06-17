import React from 'react';

import './Pagination.scss';

const Pagination = ({activePage, pageCount, setPage}) => {
  if (pageCount < 2) return null;
  const getPageButtons = () => {
    if (pageCount < 7) {
      return [...Array(pageCount).keys()].map((page) => (
        <div key={page} className={`page${page + 1 === activePage ? ' active' : ''}`} onClick={() => setPage(page + 1)}>
          {page + 1}
        </div>
      ));
    }
    const pageElements = [];
    if (activePage >= 4) {
      pageElements.push(
        <div key={activePage - 2} className="page" onClick={() => setPage(activePage - 2)}>
          {activePage - 2}
        </div>
      );
    }
    if (activePage >= 3) {
      pageElements.push(
        <div key={activePage - 1} className="page" onClick={() => setPage(activePage - 1)}>
          {activePage - 1}
        </div>
      );
    }
    if (activePage !== 1 && activePage !== pageCount) {
      pageElements.push(<div key={activePage} className="page active">{activePage}</div>);
    }
    if (activePage <= pageCount - 2) {
      pageElements.push(
        <div key={activePage + 1} className="page" onClick={() => setPage(activePage + 1)}>
          {activePage + 1}
        </div>
      );
    }
    if (activePage <= pageCount - 3) {
      pageElements.push(
        <div key={activePage + 2} className="page" onClick={() => setPage(activePage + 2)}>
          {activePage + 2}
        </div>
      );
    }
    return (
      <>
        <div className={`page${activePage === 1 ? ' active' : ''}`} onClick={() => setPage(1)}>
          1
        </div>
        {activePage >= 5 && <div className="page-placeholder">...</div>}
        {pageElements}
        {activePage <= pageCount - 4 && <div className="page-placeholder">...</div>}
        <div className={`page${activePage === pageCount ? ' active' : ''}`} onClick={() => setPage(pageCount)}>
          {pageCount}
        </div>
      </>
    );
  };
  return (
    <div className="pagination-wrapper">
      <div
        className={`arrow-button prev${activePage === 1 ? ' disabled' : ''}`}
        onClick={() => setPage(activePage - 1)}
      />
      {getPageButtons()}
      <div
        className={`arrow-button next${activePage === pageCount ? ' disabled' : ''}`}
        onClick={() => setPage(activePage + 1)}
      />
    </div>
  );
};

export default Pagination;
