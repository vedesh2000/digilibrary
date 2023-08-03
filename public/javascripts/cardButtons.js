async function addOrRemoveDailyReadBook(bookId) {
    try {
      const response = await fetch(`/files/books/${bookId}/addOrRemoveDailyReadBook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        // Success: update the page content dynamically
        const data = await response.json();
        const updatedBook = data.book;
        // Update the elements on the page with the updated book data
        // For example, you might update the class of a button or an icon to reflect the change
        // For this example, let's assume you have a button with the ID 'dailyReadButton'
        const dailyReadButton = document.getElementById('dailyReadButton'+ bookId);
        if (updatedBook.isDailyBook) {
          dailyReadButton.style.color = 'orange';
        } else {
          dailyReadButton.style.color = ''; // To remove the inline style and use the default style
        }
      } else {
        // Error handling if needed
        console.error('Error updating dailyReadBook status');
        const errorData = await response.json();
        console.error('Error message:', errorData.errorMessage);
      }
    } catch (error) {
      console.error('Error adding or removing dailyReadBook:', error);
    }
  }
  
  async function addOrRemoveFavourite(bookId) {
    try {
      const response = await fetch(`/files/books/${bookId}/addOrRemoveFav`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      console.log(response);
      if (response.ok) {
        // Success: update the page content dynamically
        const data = await response.json();
        const updatedBook = data.book;
        // Update the elements on the page with the updated book data
        // For example, you might update the class of a button or an icon to reflect the change
        // For this example, let's assume you have a button with the ID 'dailyReadButton'
        const favouriteButton = document.getElementById('favouriteButton'+ bookId);
        if (updatedBook.isFavourite) {
          favouriteButton.style.color = 'red';
        } else {
          favouriteButton.style.color = ''; // To remove the inline style and use the default style
        }
      } else {
        // Error handling if needed
        console.error('Error updating favouriteBook status');
        const errorData = await response.json();
        console.error('Error message:', errorData.errorMessage);
      }
    } catch (error) {
      console.error('Error adding or removing favouriteBook:', error);
    }
  }
  async function deleteBook(bookId) {
    try {

      // Ask for user confirmation
      const confirmed = confirm("Are you sure you want to delete this book?");
      if (!confirmed) {
        // If the user cancels, return early and don't send the delete request
        return;
      }

      const response = await fetch(`/files/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        // Success: update the page content dynamically
        const data = await response.json();
        // For example, you might show an alert to inform the user about the successful deletion
        window.location.reload();
        // Update the UI if needed (e.g., remove the deleted book from the list)
      } else {
        // Error handling if needed
        console.error('Error deleting book');
        const errorData = await response.json();
        console.error('Error message:', errorData.errorMessage);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  }
