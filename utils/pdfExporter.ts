import jsPDF from 'jspdf';
import { Itinerary, ActivityType, PackingListItem } from '../types';

export const exportItineraryToPDF = async (itinerary: Itinerary) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'pt',
    format: 'a4'
  });

  // --- Design System & Layout Constants ---
  const MARGIN = 72; // 1 inch
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
  
  const COLORS = { 
    text: '#333333',
    heading: '#001f3f',
    subtitle: '#555555',
    lightGray: '#AAAAAA',
    line: '#DDDDDD',
    accent: '#39CCCC'
  };
  
  const FONTS = {
    sans: 'helvetica' // Using helvetica as a stand-in for Inter
  };

  let cursorY = MARGIN;

  // --- Reusable Helper Functions ---

  const drawHeader = () => {
    doc.setFont(FONTS.sans, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.lightGray);
    
    const headerText = 'VoyageAI Itinerary';
    const dateText = new Date().toLocaleDateString();

    doc.text(headerText, MARGIN, 40);
    doc.text(dateText, PAGE_WIDTH - MARGIN, 40, { align: 'right' });
    
    doc.setDrawColor(COLORS.line);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, 50, PAGE_WIDTH - MARGIN, 50);
  };
  
  const drawFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      doc.setFont(FONTS.sans, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(COLORS.lightGray);
      const pageText = `Page ${i} of ${pageCount}`;
      doc.text(pageText, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 40, { align: 'right' });
    }
  };
  
  const addNewPage = () => {
    doc.addPage();
    cursorY = MARGIN;
    drawHeader();
  };
  
  const checkPageBreak = (spaceNeeded: number) => {
    if (cursorY + spaceNeeded > PAGE_HEIGHT - MARGIN) {
      addNewPage();
    }
  };
  
  // --- Main PDF Generation Logic ---
  
  // Draw header on the first page
  drawHeader();

  // H1: Main Title
  doc.setFont(FONTS.sans, 'bold');
  doc.setFontSize(26);
  doc.setTextColor(COLORS.heading);
  const titleLines = doc.splitTextToSize(itinerary.tripTitle, CONTENT_WIDTH);
  checkPageBreak(titleLines.length * 26);
  doc.text(titleLines, MARGIN, cursorY);
  cursorY += titleLines.length * 26;

  // H2: Subtitle
  cursorY += 8; // Small space after H1
  doc.setFont(FONTS.sans, 'normal');
  doc.setFontSize(16);
  doc.setTextColor(COLORS.subtitle);
  const subtitleText = `${itinerary.duration}-Day Adventure in ${itinerary.destination}`;
  const subtitleLines = doc.splitTextToSize(subtitleText, CONTENT_WIDTH);
  checkPageBreak(subtitleLines.length * 16 + 15);
  doc.text(subtitleLines, MARGIN, cursorY);
  cursorY += subtitleLines.length * 16 + 15; // 15pt space below

  // --- Daily Plans ---
  itinerary.dailyPlans.forEach(day => {
    // H3: Section Heading
    const dayTitleText = `Day ${day.day}: ${day.title}`;
    
    doc.setFont(FONTS.sans, 'bold');
    doc.setFontSize(14);
    const dayTitleDims = doc.getTextDimensions(dayTitleText, { maxWidth: CONTENT_WIDTH });
    
    cursorY += 18; // 18pt space above H3
    checkPageBreak(dayTitleDims.h + 6);
    
    doc.setTextColor(COLORS.heading);
    doc.text(dayTitleText, MARGIN, cursorY);
    cursorY += dayTitleDims.h + 6; // 6pt space below

    // Body Text: Day Summary
    doc.setFont(FONTS.sans, 'normal');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.text);
    if (day.summary) {
      const summaryLines = doc.splitTextToSize(day.summary, CONTENT_WIDTH);
      const summaryHeight = summaryLines.length * 11 * 1.5;
      checkPageBreak(summaryHeight + 8);
      doc.text(summaryLines, MARGIN, cursorY, { lineHeightFactor: 1.5 });
      cursorY += summaryHeight + 8; // 8pt space between paragraphs
    }

    // Body Text: Activities with Icons
    day.activities.forEach(activity => {
      const iconSize = 12;
      const iconPadding = 5;
      const textIndent = MARGIN + iconSize + iconPadding;
      const textWidth = CONTENT_WIDTH - (iconSize + iconPadding);

      const activityText = `(${activity.time}) ${activity.name}: ${activity.description}`;
      const activityLines = doc.splitTextToSize(activityText, textWidth);
      const activityHeight = activityLines.length * 11 * 1.5;
      const blockHeight = Math.max(iconSize, activityHeight);

      checkPageBreak(blockHeight + 8);
      
      // Fallback to a simple bullet point since icons are no longer available
      doc.text('•', MARGIN, cursorY + 8);
      
      doc.text(activityLines, textIndent, cursorY, { lineHeightFactor: 1.5 });
      cursorY += blockHeight + 8; // 8pt paragraph spacing
    });
  });

  // --- Packing List Section ---
  if (itinerary.packingList && itinerary.packingList.length > 0) {
    const packingTitleText = 'What to Pack';
    
    doc.setFont(FONTS.sans, 'bold');
    doc.setFontSize(14);
    const packingTitleDims = doc.getTextDimensions(packingTitleText);

    cursorY += 18; // 18pt space above H3
    checkPageBreak(packingTitleDims.h + 6 + 18); // Add space for content

    addNewPage(); // Start packing list on a new page for better layout if needed

    doc.setTextColor(COLORS.heading);
    doc.text(packingTitleText, MARGIN, cursorY);
    cursorY += packingTitleDims.h + 12; // 12pt space below
    
    doc.setFont(FONTS.sans, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.text);

    itinerary.packingList.forEach(item => {
        const itemText = `• ${item}`;
        const itemLines = doc.splitTextToSize(itemText, CONTENT_WIDTH);
        const itemHeight = itemLines.length * 10 * 1.5;
        
        checkPageBreak(itemHeight + 4);
        
        doc.text(itemLines, MARGIN, cursorY, { lineHeightFactor: 1.5 });
        cursorY += itemHeight + 4; // Add some space between items
    });
  }

  // --- Finalization ---
  drawFooter();

  // --- Save the PDF ---
  const filename = `VoyageAI-Itinerary-${itinerary.destination.replace(/, /g, '-')}.pdf`;
  doc.save(filename);
};