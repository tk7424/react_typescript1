import React, { useState, useEffect } from "react";
import { BookDescription } from "./BookDescription";
import BookSearchItem from "./BookSearchItem";

type BookSearchDialogProps = {
    maxresults: number;
    onBookAdd: (book: BookDescription) => void;
}

const BookSearchDialog = (props: BookSearchDialogProps) => {
    const [books, setBook] = useState([] as BookDescription[]);
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleAuthorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAuthor(e.target.value);
    };

    const handleSearchClick = () => {
        if(!title && !author) {
            alert("条件を入力してください");
            return;
        }
        setIsSearching(true);
    };

    const handleBookAdd = (book: BookDescription) => {
        props.onBookAdd(book);
    };

    const bookItems = books.map((b, idx) => {
        return (
            <BookSearchItem
                description={b}
                onBookAdd={(b) => handleBookAdd(b)}
                key={idx}
            />
        )
    });

    useEffect(() => {
        if (isSearching) {
            const url = buildSearchUrl(title, author, props.maxresults);
            fetch(url)
            .then((res) => {
                return res.json();
            })
            .then((json) => {
                return extractBooks(json);
            })
            .then((books) => {
                setBook(books);
            })
            .catch((err) => {
                console.error(err);
            });
        }
        setIsSearching(false);
    }, [isSearching]);

    return (
        <div className="dialog">
            <div className="operation">
                <div className="conditions">
                    <input type="text" onChange={handleTitleInputChange} placeholder="タイトルで検索" />
                    <input type="text" onChange={handleAuthorInputChange} placeholder="著者名で検索" />
                </div>
                <div className="button-like" onClick={handleSearchClick}>
                    検索
                </div>
            </div>
            <div className="searth-results">
                {bookItems}
            </div>
        </div>
    );
};

export default BookSearchDialog;

function buildSearchUrl(title: string, author: string, maxResults: number): string {
    let url = "https://www.googleapis.com/books/v1/volumes?q=";
    const conditions: string[] = []
    if (title) {
      conditions.push(`intitle:${title}`);
    }
    if (author) {
      conditions.push(`inauthor:${author}`);
    }
    return url + conditions.join('+') + `&maxResults=${maxResults}`;
  }
  
  function extractBooks(json: any): BookDescription[] {
    const items: any[] = json.items;
    return items.map((item: any) => {
      const volumeInfo: any = item.volumeInfo;
      return {
        title: volumeInfo.title,
        authors: volumeInfo.authors ? volumeInfo.authors.join(', ') : "",
        thumbnail: volumeInfo.imageLinks ? volumeInfo.imageLinks.smallThumbnail : "",
      }
    });
  }