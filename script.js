document.addEventListener('DOMContentLoaded', () => {
    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Check if this item is currently active
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(i => {
                i.classList.remove('active');
                const answer = i.querySelector('.faq-answer');
                answer.style.maxHeight = '0px';
                answer.style.padding = '0 24px';
            });
            
            // Open this item if it wasn't already open
            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                // Calculate height dynamically
                const scrollHeight = answer.scrollHeight;
                answer.style.maxHeight = `${scrollHeight + 24}px`; // Add padding bottom
                answer.style.padding = '0 24px 24px 24px';
            }
        });
    });

    // Handle initial state for the first item (optional, keeping all closed by default is fine)
});

