import {
	Document,
	Packer,
	Paragraph,
	TextRun,
	ImageRun,
	Table,
	TableRow,
	TableCell,
	WidthType,
	BorderStyle,
	AlignmentType,
	Header,
	Footer,
	PageNumber,
	ExternalHyperlink,
	HeadingLevel,
	VerticalAlign
} from "docx";
import { saveAs } from "file-saver";

// ─── Constants & Color Palette ────────────────────────────────────────────────
const COLOR_PRIMARY = "1B365D";    // Deep Navy Blue
const COLOR_SECONDARY = "008080";  // Teal
const COLOR_TEXT = "333333";       // Off-Black / Charcoal
const COLOR_BG_LIGHT = "F8FAFC";   // Very light grey/blue for headers
const COLOR_BORDER = "CBD5E1";     // Light grey border color
const COLOR_WHITE = "FFFFFF";

// ─── Reusable Helper Functions ────────────────────────────────────────────────

/**
 * Fetches a local/public image URL and converts it into an ArrayBuffer.
 * Wrapped in try-catch to prevent network/404 errors from breaking the report generator.
 */
async function fetchImageAsArrayBuffer(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status} fetching ${url}`);
		}
		return await response.arrayBuffer();
	} catch (error) {
		console.error(`Failed to load logo image at ${url}:`, error);
		return null;
	}
}

/**
 * Converts a React File object (from form uploads) into an ArrayBuffer.
 */
function fileToArrayBuffer(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = (err) => reject(err);
		reader.readAsArrayBuffer(file);
	});
}

/**
 * Creates a standard border object for cells.
 */
function getCellBorders(options = {}) {
	const {
		top = true,
		bottom = true,
		left = true,
		right = true,
		color = COLOR_BORDER,
		size = 4 // 1/8 pt
	} = options;

	return {
		top: top ? { style: BorderStyle.SINGLE, size, color } : { style: BorderStyle.NONE },
		bottom: bottom ? { style: BorderStyle.SINGLE, size, color } : { style: BorderStyle.NONE },
		left: left ? { style: BorderStyle.SINGLE, size, color } : { style: BorderStyle.NONE },
		right: right ? { style: BorderStyle.SINGLE, size, color } : { style: BorderStyle.NONE }
	};
}

/**
 * Generates a styled TableCell.
 */
function createTableCell(content, options = {}) {
	const {
		bold = false,
		shading = null,
		color = COLOR_TEXT,
		size = 22, // 11pt
		align = AlignmentType.LEFT,
		colspan = 1,
		rowspan = 1,
		margins = { top: 140, bottom: 140, left: 180, right: 180 }, // dxa
		border = getCellBorders(),
		italic = false
	} = options;

	let cellChildren = [];

	if (typeof content === "string") {
		cellChildren.push(
			new Paragraph({
				alignment: align,
				children: [
					new TextRun({
						text: content,
						bold,
						italic,
						color,
						size,
						font: "Calibri"
					})
				]
			})
		);
	} else if (Array.isArray(content)) {
		cellChildren = content;
	} else {
		cellChildren.push(content);
	}

	return new TableCell({
		children: cellChildren,
		columnSpan: colspan,
		rowSpan: rowspan,
		shading: shading ? { fill: shading } : undefined,
		margins,
		borders: border,
		verticalAlign: VerticalAlign.CENTER
	});
}

/**
 * Creates a thick line paragraph acting as a horizontal separator.
 */
function createDivider(color = COLOR_PRIMARY, size = 6) {
	return new Paragraph({
		spacing: { before: 200, after: 200 },
		border: {
			bottom: {
				color,
				space: 1,
				value: "single",
				size
			}
		}
	});
}

// ─── Core Report Builder Sections ─────────────────────────────────────────────

/**
 * Generates the Cover Page section children.
 * Recreates the JNTU-GV college layout.
 */
function buildCoverPage(formData, logoBuffers) {
	const elements = [];

	// 1. Logos Row Table (Horizontal arrangement of logos)
	const logoCells = [];
	const availableLogos = [
		{ key: 'college', buf: logoBuffers.college, width: 60, height: 60 },
		{ key: 'aicte', buf: logoBuffers.aicte, width: 60, height: 60 },
		{ key: 'iic', buf: logoBuffers.iic, width: 60, height: 60 },
		{ key: 'mhrd', buf: logoBuffers.mhrd, width: 90, height: 45 },
		{ key: 'me', buf: logoBuffers.me, width: 60, height: 60 }
	].filter(item => !!item.buf);

	if (availableLogos.length > 0) {
		const cellWidthPercent = 100 / availableLogos.length;
		for (const item of availableLogos) {
			logoCells.push(
				new TableCell({
					width: { size: cellWidthPercent, type: WidthType.PERCENTAGE },
					borders: getCellBorders({ top: false, bottom: false, left: false, right: false }),
					verticalAlign: VerticalAlign.CENTER,
					children: [
						new Paragraph({
							alignment: AlignmentType.CENTER,
							children: [
								new ImageRun({
									data: item.buf,
									transformation: {
										width: item.width,
										height: item.height
									}
								})
							]
						})
					]
				})
			);
		}

		elements.push(
			new Table({
				width: { size: 100, type: WidthType.PERCENTAGE },
				borders: getCellBorders({ top: false, bottom: false, left: false, right: false }),
				alignment: AlignmentType.CENTER,
				rows: [
					new TableRow({
						children: logoCells
					})
				]
			})
		);
		// Spacing below logos table
		elements.push(new Paragraph({ spacing: { before: 200 } }));
	}

	// 2. University and College Header Text
	elements.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { after: 100 },
			children: [
				new TextRun({
					text: "JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY GURAJADA VIZIANAGARAM\n",
					bold: true,
					size: 26, // 13pt
					color: COLOR_PRIMARY,
					font: "Calibri"
				}),
				new TextRun({
					text: "JNTU-GV COLLEGE OF ENGINEERING VIZIANAGARAM (A)\n",
					bold: true,
					size: 22, // 11pt
					color: COLOR_TEXT,
					font: "Calibri"
				}),
				new TextRun({
					text: "Vizianagaram - 535 003, Andhra Pradesh, INDIA\n",
					size: 18, // 9pt
					color: COLOR_TEXT,
					font: "Calibri"
				}),
				new TextRun({
					text: "(Established by Andhra Pradesh Act NO.22 of 2021)",
					italic: true,
					size: 16, // 8pt
					color: COLOR_TEXT,
					font: "Calibri"
				})
			]
		})
	);

	// Separator Line
	elements.push(createDivider(COLOR_PRIMARY, 12));

	// 3. Document Title
	elements.push(new Paragraph({ spacing: { before: 400 } }));
	elements.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { after: 100 },
			children: [
				new TextRun({
					text: "A Report\n",
					bold: true,
					size: 28, // 14pt
					color: COLOR_TEXT,
					font: "Calibri"
				}),
				new TextRun({
					text: "on\n",
					italic: true,
					size: 22, // 11pt
					color: COLOR_TEXT,
					font: "Calibri"
				}),
				new TextRun({
					text: `${formData.eventLevel} Level ${formData.eventType}\n`.toUpperCase(),
					bold: true,
					size: 24, // 12pt
					color: COLOR_SECONDARY,
					font: "Calibri"
				})
			]
		})
	);

	// Event Title Banner Box
	elements.push(
		new Table({
			width: { size: 100, type: WidthType.PERCENTAGE },
			alignment: AlignmentType.CENTER,
			rows: [
				new TableRow({
					children: [
						createTableCell(
							formData.eventTitle.toUpperCase(),
							{
								bold: true,
								size: 32, // 16pt
								color: COLOR_PRIMARY,
								align: AlignmentType.CENTER,
								shading: "F1F5F9", // Light slate background
								border: getCellBorders({ color: COLOR_PRIMARY, size: 8 })
							}
						)
					]
				})
			]
		})
	);

	elements.push(new Paragraph({ spacing: { before: 300 } }));

	// Theme / Sponsoring details
	elements.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { after: 300 },
			children: [
				new TextRun({
					text: "Theme: ",
					bold: true,
					size: 22,
					font: "Calibri"
				}),
				new TextRun({
					text: formData.theme || "N/A",
					italic: true,
					size: 22,
					font: "Calibri"
				})
			]
		})
	);

	// 4. Dates
	elements.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { after: 400 },
			children: [
				new TextRun({
					text: "Conducted on\n",
					italic: true,
					size: 20,
					font: "Calibri"
				}),
				new TextRun({
					text: `${new Date(formData.startDate).toLocaleDateString(undefined, { dateStyle: 'long' })} to ${new Date(formData.endDate).toLocaleDateString(undefined, { dateStyle: 'long' })}\n`,
					bold: true,
					size: 24,
					color: COLOR_PRIMARY,
					font: "Calibri"
				}),
				new TextRun({
					text: `(Duration: ${formData.durationDays} Days)`,
					size: 18,
					font: "Calibri"
				})
			]
		})
	);

	// 5. Organizing Committee
	elements.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { after: 100 },
			children: [
				new TextRun({
					text: "Organized by\n",
					italic: true,
					size: 20,
					font: "Calibri"
				}),
				new TextRun({
					text: `${formData.organizingDepartment.toUpperCase()}\n`,
					bold: true,
					size: 24,
					color: COLOR_PRIMARY,
					font: "Calibri"
				})
			]
		})
	);

	// Sponsorship/Collaborations
	const extraOrgs = [];
	if (formData.sponsoringAgency) {
		extraOrgs.push(`Sponsored by: ${formData.sponsoringAgency}`);
	}
	if (formData.collaborationPartner) {
		extraOrgs.push(`In Collaboration with: ${formData.collaborationPartner}`);
	}
	if (extraOrgs.length > 0) {
		elements.push(
			new Paragraph({
				alignment: AlignmentType.CENTER,
				spacing: { after: 200 },
				children: [
					new TextRun({
						text: extraOrgs.join(" | "),
						bold: true,
						size: 20,
						color: COLOR_SECONDARY,
						font: "Calibri"
					})
				]
			})
		);
	}

	// 6. Academic Year at the bottom
	elements.push(new Paragraph({ spacing: { before: 400 } }));
	const startYear = new Date(formData.startDate).getFullYear();
	const endYear = new Date(formData.endDate).getFullYear();
	const academicYear = startYear === endYear ? `${startYear - 1}–${startYear}` : `${startYear}–${endYear}`;

	elements.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			children: [
				new TextRun({
					text: `Academic Year: ${academicYear}`,
					bold: true,
					size: 22,
					color: COLOR_TEXT,
					font: "Calibri"
				})
			]
		})
	);

	return elements;
}

/**
 * Builds the Event Parameters / Metadata Table.
 */
function buildMetadataTable(formData) {
	const tableRows = [];

	// Helper to add a row to the table
	const addMetadataRow = (label, value) => {
		tableRows.push(
			new TableRow({
				children: [
					createTableCell(label, { bold: true, shading: COLOR_BG_LIGHT, width: 30, color: COLOR_PRIMARY }),
					createTableCell(value || "N/A", { width: 70 })
				]
			})
		);
	};

	addMetadataRow("Event Title", formData.eventTitle);
	addMetadataRow("Event Type", formData.eventType);
	addMetadataRow("Category", formData.eventCategory);
	addMetadataRow("Level of Activity", formData.eventLevel);
	addMetadataRow("Theme / Topic", formData.theme);
	addMetadataRow("Mode & Location", `${formData.mode} ${formData.venue ? `(Venue: ${formData.venue})` : ''} ${formData.platform ? `(Platform: ${formData.platform})` : ''}`);
	addMetadataRow("Dates & Duration", `${new Date(formData.startDate).toLocaleDateString()} to ${new Date(formData.endDate).toLocaleDateString()} (${formData.durationDays} days)`);
	addMetadataRow("Organizing Department", formData.organizingDepartment);
	addMetadataRow("Coordinator Name", formData.coordinatorName);
	if (formData.coCoordinator) addMetadataRow("Co-coordinator", formData.coCoordinator);
	if (formData.facultyMembers) addMetadataRow("Committee Members", formData.facultyMembers);
	addMetadataRow("Student Coordinators", formData.studentCoordinators);

	// Participant details
	const attendeeDetail = `Total Attended: ${formData.totalAttended} (Registrations: ${formData.totalRegistrations})\n` +
		`- Students: ${formData.studentCount}\n` +
		`- Faculty Members: ${formData.facultyCount}\n` +
		`- External Participants: ${formData.externalParticipants}`;
	addMetadataRow("Participants Summary", attendeeDetail);

	if (formData.budgetSanctioned || formData.sponsoringAgency) {
		addMetadataRow("Budget & Sponsors", `Sanctioned Budget: ${formData.budgetSanctioned ? `${formData.budgetSanctioned} INR` : "N/A"}\nSponsoring Agency: ${formData.sponsoringAgency || "N/A"}`);
	}

	return new Table({
		width: { size: 100, type: WidthType.PERCENTAGE },
		alignment: AlignmentType.CENTER,
		rows: tableRows
	});
}

/**
 * Builds the detailed Sessions Table.
 */
async function buildSessionsTable(sessions) {
	const tableRows = [];

	// Table Header
	tableRows.push(
		new TableRow({
			children: [
				createTableCell("Session Details", { bold: true, color: COLOR_WHITE, shading: COLOR_PRIMARY, align: AlignmentType.CENTER, width: 25 }),
				createTableCell("Resource Person / Speaker", { bold: true, color: COLOR_WHITE, shading: COLOR_PRIMARY, align: AlignmentType.CENTER, width: 35 }),
				createTableCell("Session Summary & Uploaded Media", { bold: true, color: COLOR_WHITE, shading: COLOR_PRIMARY, align: AlignmentType.CENTER, width: 40 })
			]
		})
	);

	// Loop through sessions and build rows
	for (const s of sessions) {
		// Session metadata details
		const timeStr = `${s.startTime || ""} - ${s.endTime || ""}`;
		const dateStr = s.sessionDate ? new Date(s.sessionDate).toLocaleDateString() : "";
		const sessionDetails = `ID: ${s.sessionId || "N/A"}\n` +
			`Title: ${s.sessionTitle}\n` +
			`Date: ${dateStr}\n` +
			`Time: ${timeStr}`;

		// Speaker metadata details
		const speakerDetails = `Name: ${s.speakerName}\n` +
			`Designation: ${s.designation || "N/A"}\n` +
			`Org: ${s.organization || "N/A"}\n` +
			`Qualification: ${s.qualification || "N/A"}\n` +
			`Expertise: ${s.expertiseArea || "N/A"}\n` +
			`Email: ${s.email || "N/A"}\n` +
			`Mobile: ${s.mobile || "N/A"}`;

		// Description + Photo if present
		const descParagraphs = [
			new Paragraph({
				spacing: { after: 120 },
				children: [
					new TextRun({
						text: s.sessionSummary || "No description provided.",
						font: "Calibri",
						size: 20 // 10pt
					})
				]
			})
		];

		// If a photo was uploaded, convert and add it to cell
		if (s.photoFile instanceof File) {
			try {
				const photoBuffer = await fileToArrayBuffer(s.photoFile);
				descParagraphs.push(
					new Paragraph({
						alignment: AlignmentType.CENTER,
						spacing: { before: 100 },
						children: [
							new ImageRun({
								data: photoBuffer,
								transformation: {
									width: 180,
									height: 120
								}
							}),
							new Paragraph({
								alignment: AlignmentType.CENTER,
								children: [
									new TextRun({
										text: "\nSession Photo",
										italic: true,
										size: 16,
										color: "666666"
									})
								]
							})
						]
					})
				);
			} catch (e) {
				console.error("Failed to render session photo into DOCX:", e);
			}
		}

		tableRows.push(
			new TableRow({
				children: [
					createTableCell(sessionDetails, { size: 20 }),
					createTableCell(speakerDetails, { size: 20 }),
					createTableCell(descParagraphs)
				]
			})
		);
	}

	return new Table({
		width: { size: 100, type: WidthType.PERCENTAGE },
		alignment: AlignmentType.CENTER,
		rows: tableRows
	});
}

/**
 * Builds the uploaded documents list (external URLs formatted as clickable hyperlinks).
 */
function buildDocumentsLinks(docs) {
	const paragraphs = [];
	const availableLinks = Object.entries(docs).filter(([key, val]) => {
		const isLink = key.toLowerCase().includes('link');
		return isLink && !!val;
	});

	if (availableLinks.length === 0) {
		paragraphs.push(
			new Paragraph({
				children: [
					new TextRun({
						text: "No external links provided.",
						italic: true,
						font: "Calibri",
						color: "666666"
					})
				]
			})
		);
		return paragraphs;
	}

	for (const [key, url] of availableLinks) {
		paragraphs.push(
			new Paragraph({
				spacing: { before: 80, after: 80 },
				children: [
					new TextRun({
						text: `• ${key}: `,
						bold: true,
						font: "Calibri"
					}),
					new ExternalHyperlink({
						children: [
							new TextRun({
								text: url,
								style: "Hyperlink",
								color: "0056b3",
								underline: true,
								font: "Calibri"
							})
						],
						link: url
					})
				]
			})
		);
	}

	return paragraphs;
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

/**
 * Creates the complete Document object and triggers the Packer to build and save it.
 */
export async function generateDocxReport(formData, sessions, docs) {
	console.log("Starting report generation...", { formData, sessions, docs });

	// 1. Pre-load logos in parallel
	const logoUrls = {
		college: "/ReportLogos/Logo.png",
		aicte: "/ReportLogos/aicte.png",
		iic: "/ReportLogos/iic.png",
		mhrd: "/ReportLogos/mhrd_ic.jpg",
		me: "/ReportLogos/me.png"
	};

	const logoBuffers = {};
	await Promise.all(
		Object.entries(logoUrls).map(async ([key, url]) => {
			const buffer = await fetchImageAsArrayBuffer(url);
			if (buffer) logoBuffers[key] = buffer;
		})
	);

	// 2. Build Cover Page section
	const coverPageChildren = buildCoverPage(formData, logoBuffers);

	// 3. Build main headers and footers for the body section
	const bodyHeader = new Header({
		children: [
			new Table({
				width: { size: 100, type: WidthType.PERCENTAGE },
				borders: getCellBorders({ top: false, bottom: true, left: false, right: false, color: COLOR_PRIMARY, size: 8 }),
				rows: [
					new TableRow({
						children: [
							new TableCell({
								width: { size: 15, type: WidthType.PERCENTAGE },
								borders: getCellBorders({ top: false, bottom: false, left: false, right: false }),
								verticalAlign: VerticalAlign.CENTER,
								children: [
									logoBuffers.college ? new Paragraph({
										alignment: AlignmentType.LEFT,
										children: [
											new ImageRun({
												data: logoBuffers.college,
												transformation: { width: 32, height: 32 }
											})
										]
									}) : new Paragraph("")
								]
							}),
							new TableCell({
								width: { size: 85, type: WidthType.PERCENTAGE },
								borders: getCellBorders({ top: false, bottom: false, left: false, right: false }),
								verticalAlign: VerticalAlign.CENTER,
								children: [
									new Paragraph({
										alignment: AlignmentType.LEFT,
										children: [
											new TextRun({
												text: "JNTU-GV COLLEGE OF ENGINEERING VIZIANAGARAM (A)\n",
												bold: true,
												size: 18,
												color: COLOR_PRIMARY,
												font: "Calibri"
											}),
											new TextRun({
												text: `Department of ${formData.organizingDepartment} - Activity Report`,
												size: 16,
												color: COLOR_TEXT,
												font: "Calibri"
											})
										]
									})
								]
							})
						]
					})
				]
			}),
			new Paragraph({ spacing: { before: 100 } }) // Spacing after header line
		]
	});

	const bodyFooter = new Footer({
		children: [
			new Table({
				width: { size: 100, type: WidthType.PERCENTAGE },
				borders: getCellBorders({ top: true, bottom: false, left: false, right: false, color: COLOR_BORDER }),
				rows: [
					new TableRow({
						children: [
							new TableCell({
								width: { size: 60, type: WidthType.PERCENTAGE },
								borders: getCellBorders({ top: false, bottom: false, left: false, right: false }),
								verticalAlign: VerticalAlign.CENTER,
								children: [
									new Paragraph({
										alignment: AlignmentType.LEFT,
										children: [
											new TextRun({
												text: `Report: ${formData.eventTitle}`,
												italic: true,
												size: 16,
												color: "666666",
												font: "Calibri"
											})
										]
									})
								]
							}),
							new TableCell({
								width: { size: 40, type: WidthType.PERCENTAGE },
								borders: getCellBorders({ top: false, bottom: false, left: false, right: false }),
								verticalAlign: VerticalAlign.CENTER,
								children: [
									new Paragraph({
										alignment: AlignmentType.RIGHT,
										children: [
											new TextRun({ text: "Page ", size: 16, color: "666666", font: "Calibri" }),
											new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "666666", font: "Calibri" }),
											new TextRun({ text: " of ", size: 16, color: "666666", font: "Calibri" }),
											new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "666666", font: "Calibri" })
										]
									})
								]
							})
						]
					})
				]
			})
		]
	});

	// 4. Build Report Body Elements
	const bodyChildren = [];

	// Title / Introduction Section
	bodyChildren.push(
		new Paragraph({
			text: "1. Event Overview & Metadata",
			heading: HeadingLevel.HEADING_1,
			spacing: { before: 200, after: 150 },
			border: { bottom: { color: COLOR_SECONDARY, value: "single", size: 4 } }
		})
	);

	bodyChildren.push(
		new Paragraph({
			spacing: { after: 150 },
			children: [
				new TextRun({
					text: "The institutional department event details and overall participant metrics are summarized in the table below.",
					font: "Calibri"
				})
			]
		})
	);

	bodyChildren.push(buildMetadataTable(formData));
	bodyChildren.push(new Paragraph({ spacing: { before: 200 } }));

	// Objective Description
	bodyChildren.push(
		new Paragraph({
			text: "2. Objectives & Theme Context",
			heading: HeadingLevel.HEADING_1,
			spacing: { before: 300, after: 150 },
			border: { bottom: { color: COLOR_SECONDARY, value: "single", size: 4 } }
		})
	);

	bodyChildren.push(
		new Paragraph({
			spacing: { after: 100 },
			children: [
				new TextRun({ text: "Objective of the Event:\n", bold: true, color: COLOR_PRIMARY, font: "Calibri" }),
				new TextRun({ text: formData.objective || "No objectives entered.", font: "Calibri" })
			]
		})
	);

	bodyChildren.push(
		new Paragraph({
			spacing: { before: 150, after: 200 },
			children: [
				new TextRun({ text: "Key Theme Details:\n", bold: true, color: COLOR_PRIMARY, font: "Calibri" }),
				new TextRun({ text: formData.theme || "No theme context entered.", font: "Calibri" })
			]
		})
	);

	// Resource Persons / Sessions Section
	bodyChildren.push(
		new Paragraph({
			text: "3. Sessions & Resource Persons",
			heading: HeadingLevel.HEADING_1,
			spacing: { before: 300, after: 150 },
			border: { bottom: { color: COLOR_SECONDARY, value: "single", size: 4 } }
		})
	);

	bodyChildren.push(
		new Paragraph({
			spacing: { after: 150 },
			children: [
				new TextRun({
					text: "The detailed schedule of technical sessions and profile details of associated external resource speakers is listed in the schedule matrix below.",
					font: "Calibri"
				})
			]
		})
	);

	const sessionsTable = await buildSessionsTable(sessions);
	bodyChildren.push(sessionsTable);
	bodyChildren.push(new Paragraph({ spacing: { before: 200 } }));

	// External / Document Links Section
	bodyChildren.push(
		new Paragraph({
			text: "4. Verification Links & Gallery",
			heading: HeadingLevel.HEADING_1,
			spacing: { before: 300, after: 150 },
			border: { bottom: { color: COLOR_SECONDARY, value: "single", size: 4 } }
		})
	);

	bodyChildren.push(
		new Paragraph({
			spacing: { after: 100 },
			children: [
				new TextRun({
					text: "Verified external reference materials, social listings, video streams, and digital photography galleries can be accessed using the following active hyperlinks:",
					font: "Calibri"
				})
			]
		})
	);

	const links = buildDocumentsLinks(docs);
	bodyChildren.push(...links);
	bodyChildren.push(new Paragraph({ spacing: { before: 200 } }));

	// Conclusion Section
	bodyChildren.push(
		new Paragraph({
			text: "5. Outcome & Conclusion",
			heading: HeadingLevel.HEADING_1,
			spacing: { before: 300, after: 150 },
			border: { bottom: { color: COLOR_SECONDARY, value: "single", size: 4 } }
		})
	);

	bodyChildren.push(
		new Paragraph({
			spacing: { after: 100 },
			children: [
				new TextRun({
					text: `The ${formData.eventType} was successfully concluded by the ${formData.organizingDepartment}. A total of ${formData.totalAttended} attendees successfully took part in this collaborative skill enrichment program.`,
					font: "Calibri"
				})
			]
		})
	);

	bodyChildren.push(
		new Paragraph({
			spacing: { before: 100, after: 300 },
			children: [
				new TextRun({
					text: "Participants successfully gained actionable knowledge matching the predefined syllabus, establishing foundational skills in alignment with university standards. Feedback was overwhelmingly positive, noting excellent coordination and expertise of the speakers.",
					font: "Calibri"
				})
			]
		})
	);

	// Signature Section at the bottom
	bodyChildren.push(new Paragraph({ spacing: { before: 400 } }));
	bodyChildren.push(
		new Table({
			width: { size: 100, type: WidthType.PERCENTAGE },
			borders: getCellBorders({ top: false, bottom: false, left: false, right: false }),
			rows: [
				new TableRow({
					children: [
						new TableCell({
							width: { size: 50, type: WidthType.PERCENTAGE },
							borders: getCellBorders({ top: false, bottom: false, left: false, right: false }),
							children: [
								new Paragraph({
									children: [
										new TextRun({ text: "Prepared by:\n\n\n\n", font: "Calibri" }),
										new TextRun({ text: `${formData.coordinatorName}`, bold: true, font: "Calibri" }),
										new TextRun({ text: `\nEvent Coordinator`, font: "Calibri", size: 18 })
									]
								})
							]
						}),
						new TableCell({
							width: { size: 50, type: WidthType.PERCENTAGE },
							borders: getCellBorders({ top: false, bottom: false, left: false, right: false }),
							children: [
								new Paragraph({
									alignment: AlignmentType.RIGHT,
									children: [
										new TextRun({ text: "Approved by:\n\n\n\n", font: "Calibri" }),
										new TextRun({ text: "Head of the Department", bold: true, font: "Calibri" }),
										new TextRun({ text: `\n${formData.organizingDepartment}`, font: "Calibri", size: 18 })
									]
								})
							]
						})
					]
				})
			]
		})
	);

	// 5. Build Document
	const doc = new Document({
		sections: [
			{
				properties: {
					page: {
						margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } // 1 inch margins
					}
				},
				children: coverPageChildren
			},
			{
				properties: {
					page: {
						margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
					}
				},
				headers: {
					default: bodyHeader
				},
				footers: {
					default: bodyFooter
				},
				children: bodyChildren
			}
		],
		// Simple heading styles override to make them look nice and match our navy/teal theme
		features: {
			updateFields: true
		},
		styles: {
			paragraphStyles: [
				{
					id: "Heading1",
					name: "Heading 1",
					basedOn: "Normal",
					nextParagraph: "Normal",
					quickFormat: true,
					run: {
						size: 26, // 13pt
						bold: true,
						color: COLOR_PRIMARY,
						font: "Calibri"
					},
					paragraph: {
						spacing: { before: 240, after: 120, line: 240 }
					}
				}
			]
		}
	});

	// 6. Generate and Download
	try {
		const blob = await Packer.toBlob(doc);
		const cleanTitle = formData.eventTitle.replace(/[^a-zA-Z0-9-_]/g, "_");
		const filename = `${cleanTitle}_Event_Report.docx`;
		saveAs(blob, filename);
		console.log("Report downloaded successfully as:", filename);
		return true;
	} catch (error) {
		console.error("Failed to generate and download Word document:", error);
		throw error;
	}
}
