import { PaginationItem, PaginationNext, PaginationPrevious, PaginationRoot } from '@vyrnforge/react/pagination';
export function Example(){return <PaginationRoot><PaginationPrevious href="?page=1">Previous</PaginationPrevious><PaginationItem href="?page=2" current>2</PaginationItem><PaginationNext href="?page=3">Next</PaginationNext></PaginationRoot>;}
