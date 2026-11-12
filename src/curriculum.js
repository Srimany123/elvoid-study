// Gate to GPT curriculum (generated). Order is the learning sequence; phases marked branch use explicit prerequisites.
const CURRICULUM = [
 {
  "code": "OR",
  "name": "Orientation & Tooling",
  "layer": "Workbench",
  "blurb": "Get the mental map of the whole machine and the tools every engineer uses daily.",
  "topics": [
   {
    "id": "OR1",
    "t": "How Computers Work: The Big Picture",
    "h": 10,
    "w": "Gives you the map: every later topic is one layer of this picture zoomed in.",
    "s": [
     "Bits, bytes and why everything is binary",
     "Layers of abstraction: physics → gates → CPU → OS → apps",
     "What a CPU, memory and storage each do",
     "Compilers vs interpreters",
     "What the operating system is for",
     "How the internet moves a web page to you",
     "Trace one program from source code to running process"
    ],
    "r": [
     "CS50x, weeks 0–1 (Harvard, free)",
     "Code: The Hidden Language of Computer Hardware and Software, Charles Petzold",
     "Crash Course Computer Science (YouTube)"
    ],
    "p": "Write a one-page explanation, with a diagram, of what happens between pressing Enter on a URL and the page appearing."
   },
   {
    "id": "OR2",
    "t": "Linux & the Shell",
    "h": 15,
    "w": "Servers, the Pi, security tools and ML training all live in a terminal.",
    "s": [
     "Filesystem layout and paths",
     "Users, groups and permissions",
     "Pipes, redirection and exit codes",
     "Processes, signals and job control",
     "grep, sed, awk, find, xargs",
     "Shell scripting: variables, loops, functions",
     "SSH, keys and remote work",
     "Package managers and services (apt, systemd)"
    ],
    "r": [
     "The Missing Semester of Your CS Education (MIT, free)",
     "The Linux Command Line, William Shotts (free PDF)",
     "OverTheWire: Bandit wargame"
    ],
    "p": "Finish OverTheWire Bandit levels 0–20, then write a shell script that backs up a folder to your Pi over SSH."
   },
   {
    "id": "OR3",
    "t": "Git & Version Control",
    "h": 8,
    "w": "Every project from here on should live in a Git repository.",
    "s": [
     "Commits, the staging area and history",
     "Branches and merging",
     "Rebasing and resolving conflicts",
     "Remotes, push, pull and forks",
     "Pull request workflow on GitHub",
     "git bisect, reflog and recovering mistakes",
     ".gitignore and repo hygiene"
    ],
    "r": [
     "Pro Git, Scott Chacon (free online)",
     "Learn Git Branching (interactive, free)",
     "Missing Semester: Version Control lecture"
    ],
    "p": "Create a public GitHub repo for this whole curriculum and commit every project into it."
   },
   {
    "id": "OR4",
    "t": "Developer Workflow: Editors, Debuggers, Environments",
    "h": 8,
    "w": "Fast feedback loops make every later topic cheaper to learn.",
    "s": [
     "Editor fluency (VS Code or Vim keybindings)",
     "Using a debugger: breakpoints, stepping, watches",
     "Python virtual environments and conda",
     "Build tools: make and build scripts",
     "Docker basics: images, containers, volumes",
     "Reading documentation and source effectively"
    ],
    "r": [
     "Missing Semester: Editors, Debugging and Profiling",
     "Docker's official Get Started guide",
     "VS Code documentation"
    ],
    "p": "Containerize a small Python script and debug a deliberately broken version of it with breakpoints."
   },
   {
    "id": "OR5",
    "t": "AI-Assisted Development",
    "h": 10,
    "w": "Coding assistants are now part of the job; using them well (and safely) is a skill.",
    "s": [
     "How LLM coding assistants work and where they fail",
     "Prompting for code: context, constraints, examples",
     "Agentic tools: Claude Code, Copilot, Cursor",
     "Reviewing and testing AI-written code",
     "Security and licensing risks of generated code",
     "Keeping your own skills sharp: when not to use AI"
    ],
    "r": [
     "Claude Code documentation",
     "roadmap.sh: Claude Code and AI Agents roadmaps",
     "Simon Willison's blog on AI-assisted programming"
    ],
    "p": "Build one small tool with an AI assistant and one without, then compare time spent, bugs found and what you learned."
   }
  ],
  "refs": [
   "roadmap.sh: Linux, Shell/Bash, Git and GitHub, Claude Code",
   "OSSU: CS Tools (Missing Semester)"
  ]
 },
 {
  "code": "PR",
  "name": "Programming Foundations",
  "layer": "Language",
  "blurb": "Learn to express ideas as code in a high-level language and a low-level one.",
  "topics": [
   {
    "id": "PR1",
    "t": "Programming in Python",
    "h": 40,
    "w": "The working language of ML, scripting and automation.",
    "s": [
     "Variables, types and expressions",
     "Control flow and functions",
     "Lists, dicts, sets, tuples",
     "Strings and file I/O",
     "Errors and exceptions",
     "Modules and packages",
     "Classes and objects",
     "Comprehensions, iterators and generators",
     "Decorators and context managers",
     "Type hints and testing with pytest"
    ],
    "r": [
     "CS50's Introduction to Programming with Python (free)",
     "Automate the Boring Stuff with Python, Al Sweigart (free)",
     "Fluent Python, Luciano Ramalho (later)"
    ],
    "p": "Build a command-line expense tracker that stores data in SQLite and prints monthly summaries.",
    "pre": [
     "OR2"
    ]
   },
   {
    "id": "PR2",
    "t": "Programming in C",
    "h": 50,
    "w": "C shows you what the machine is actually doing: memory, pointers, layout.",
    "s": [
     "Types, operators and integer sizes",
     "Pointers and pointer arithmetic",
     "Arrays and strings",
     "Structs, unions and enums",
     "Dynamic memory: malloc, free, leaks",
     "The preprocessor and header files",
     "Compilation, object files and linking",
     "Undefined behavior and how to avoid it",
     "Tools: gcc flags, valgrind, AddressSanitizer"
    ],
    "r": [
     "The C Programming Language (K&R)",
     "CS50x weeks 1–5",
     "Beej's Guide to C Programming (free)"
    ],
    "p": "Write your own dynamic array, linked list and hash map in C, with no memory leaks under valgrind."
   },
   {
    "id": "PR3",
    "t": "Programming Paradigms",
    "h": 25,
    "w": "Different styles of thinking make you better in every language.",
    "s": [
     "Object-oriented design: encapsulation, inheritance, polymorphism",
     "SOLID principles",
     "Functional style: pure functions, immutability",
     "Higher-order functions and closures",
     "Recursion as a way of thinking",
     "Declarative programming (SQL, regex, Prolog taste)",
     "Event-driven and reactive programming",
     "Functional programming in depth (Haskell taste)",
     "Logic programming (Prolog taste)"
    ],
    "r": [
     "Structure and Interpretation of Computer Programs (SICP, free)",
     "Composing Programs (Python-based SICP, free)",
     "Head First Design Patterns"
    ],
    "p": "Write a small interpreter for arithmetic expressions twice: once OOP-style, once functional."
   },
   {
    "id": "PR4",
    "t": "A Systems Language: Rust, C++ or Go",
    "h": 50,
    "w": "Modern high-performance and security-critical code is written in these.",
    "s": [
     "Ownership, borrowing and lifetimes (Rust) or RAII (C++)",
     "Smart pointers and move semantics",
     "Generics and templates",
     "Traits / interfaces and dynamic dispatch",
     "Standard collections and iterators",
     "Error handling: Result vs exceptions",
     "Concurrency primitives",
     "Cargo / CMake build systems",
     "Go basics for servers and cloud tooling (optional)"
    ],
    "r": [
     "The Rust Programming Language (free)",
     "Rustlings exercises",
     "learncpp.com (free)",
     "A Tour of C++, Bjarne Stroustrup"
    ],
    "p": "Rewrite your C hash map in Rust or modern C++ and benchmark both.",
    "pre": [
     "PR2"
    ]
   }
  ],
  "refs": [
   "roadmap.sh: Python, C, C++, Rust, Go",
   "OSSU: Intro CS, Core programming",
   "Teach Yourself CS: Programming (SICP)",
   "CS2023: Software Development Fundamentals, Foundations of Programming Languages"
  ]
 },
 {
  "code": "DM",
  "name": "Discrete Mathematics",
  "layer": "Logic",
  "blurb": "The math of computing: proofs, counting and graphs. Needed for algorithms, crypto and theory.",
  "topics": [
   {
    "id": "DM1",
    "t": "Logic & Proofs",
    "h": 30,
    "w": "Algorithms, theory and security arguments are all proofs.",
    "s": [
     "Propositional logic and truth tables",
     "Predicates and quantifiers",
     "Direct proof and proof by contrapositive",
     "Proof by contradiction",
     "Mathematical and strong induction",
     "Sets and set operations",
     "Functions: injective, surjective, bijective",
     "Relations: equivalence and partial orders"
    ],
    "r": [
     "Book of Proof, Richard Hammack (free)",
     "MIT 6.1200J Mathematics for Computer Science (OCW)",
     "Mathematics for Computer Science, Lehman, Leighton, Meyer (free PDF)"
    ],
    "p": "Prove 10 statements in writing, including 3 by induction about programs (e.g. a loop invariant)."
   },
   {
    "id": "DM2",
    "t": "Combinatorics & Number Theory",
    "h": 30,
    "w": "Counting drives algorithm analysis and probability; number theory is the core of cryptography.",
    "s": [
     "Sum and product rules",
     "Permutations and combinations",
     "Pigeonhole principle",
     "Inclusion–exclusion",
     "Recurrence relations",
     "Generating functions",
     "Modular arithmetic",
     "GCD and the Euclidean algorithm",
     "Primes and factorization",
     "Fermat's little theorem and Euler's theorem",
     "Chinese remainder theorem"
    ],
    "r": [
     "MIT 6.1200J (OCW)",
     "Concrete Mathematics, Graham, Knuth, Patashnik",
     "Project Euler (practice)"
    ],
    "p": "Implement modular exponentiation, extended Euclid and a toy RSA from scratch in Python.",
    "pre": [
     "DM1"
    ]
   },
   {
    "id": "DM3",
    "t": "Graph Theory",
    "h": 20,
    "w": "Networks, compilers, maps, social graphs and neural nets are graphs.",
    "s": [
     "Graphs, degrees and representations",
     "Paths, cycles and connectivity",
     "Trees and spanning trees",
     "Euler and Hamilton paths",
     "Bipartite graphs and matchings",
     "Planarity and coloring",
     "Directed acyclic graphs"
    ],
    "r": [
     "MIT 6.1200J graph units",
     "Introduction to Graph Theory, Richard Trudeau",
     "Graph Theory with Applications, Bondy & Murty (free)"
    ],
    "p": "Model your city's bus or campus map as a graph and compute shortest routes with a library.",
    "pre": [
     "DM1"
    ]
   },
   {
    "id": "DM4",
    "t": "Abstract Algebra for CS",
    "h": 20,
    "w": "Groups, rings and finite fields are the math inside AES, elliptic curves, error-correcting codes and CRCs.",
    "s": [
     "Groups, subgroups and cyclic groups",
     "Rings and polynomial rings",
     "Fields and finite fields GF(p) and GF(2^n)",
     "Modular polynomial arithmetic",
     "Group of points on an elliptic curve",
     "Applications: AES S-box, CRC, Reed–Solomon"
    ],
    "r": [
     "A Book of Abstract Algebra, Charles Pinter",
     "A Computational Introduction to Number Theory and Algebra, Victor Shoup (free)"
    ],
    "p": "Implement GF(2^8) arithmetic and use it to compute the AES S-box from scratch.",
    "pre": [
     "DM2"
    ]
   }
  ],
  "refs": [
   "OSSU: Core math (Mathematics for Computer Science)",
   "Teach Yourself CS: Math for CS",
   "CS2023: Mathematical and Statistical Foundations"
  ],
  "branch": true
 },
 {
  "code": "HW",
  "name": "Hardware: Electrons to Gates",
  "layer": "Silicon",
  "blurb": "How physics becomes logic: circuits, gates, memory elements and a computer built from NAND.",
  "topics": [
   {
    "id": "HW1",
    "t": "Electronics Fundamentals",
    "h": 25,
    "w": "Every bit is a voltage. This is the floor of the whole stack.",
    "s": [
     "Voltage, current, resistance and Ohm's law",
     "Kirchhoff's laws and circuit analysis",
     "Capacitors, inductors and RC timing",
     "Diodes and LEDs",
     "Transistors: BJT and MOSFET as switches",
     "The CMOS inverter",
     "Clocks, signals and noise",
     "Breadboarding and using a multimeter"
    ],
    "r": [
     "All About Circuits (free online textbook)",
     "The Art of Electronics, Horowitz & Hill",
     "Ben Eater's YouTube channel"
    ],
    "p": "Breadboard a transistor-based NOT and NAND gate and measure them with a multimeter (or simulate in Falstad).",
    "pre": [
     "OR1"
    ]
   },
   {
    "id": "HW2",
    "t": "Number Systems & Data Representation",
    "h": 10,
    "w": "Bugs in overflow, floats and text encoding come from here.",
    "s": [
     "Binary, octal and hexadecimal",
     "Two's complement and overflow",
     "Fixed-point numbers",
     "IEEE 754 floating point",
     "ASCII, Unicode and UTF-8",
     "Endianness",
     "Bitwise operations and masks"
    ],
    "r": [
     "CS:APP (Computer Systems: A Programmer's Perspective), chapter 2",
     "Float Toy (interactive)",
     "Joel Spolsky: The Absolute Minimum About Unicode"
    ],
    "p": "Write a program that prints the raw bits of any int, float or UTF-8 string."
   },
   {
    "id": "HW3",
    "t": "Boolean Algebra & Logic Gates",
    "h": 12,
    "w": "The algebra that lets you design any digital circuit.",
    "s": [
     "Boolean operators and truth tables",
     "Boolean laws and De Morgan",
     "Sum-of-products and product-of-sums",
     "Karnaugh maps",
     "NAND and NOR universality",
     "Gates built from CMOS transistors"
    ],
    "r": [
     "Nand2Tetris (The Elements of Computing Systems), chapter 1",
     "Digital Design and Computer Architecture, Harris & Harris"
    ],
    "p": "Build AND, OR, XOR, MUX and DMUX from NAND only in the Nand2Tetris simulator."
   },
   {
    "id": "HW4",
    "t": "Combinational Logic",
    "h": 15,
    "w": "Adders and ALUs are where arithmetic becomes hardware.",
    "s": [
     "Multiplexers and demultiplexers",
     "Encoders and decoders",
     "Half and full adders",
     "Ripple-carry and carry-lookahead adders",
     "Building an ALU",
     "Comparators",
     "Propagation delay and critical paths"
    ],
    "r": [
     "Nand2Tetris chapter 2",
     "Harris & Harris chapter 2 and 5"
    ],
    "p": "Build the Nand2Tetris 16-bit ALU and pass all its tests."
   },
   {
    "id": "HW5",
    "t": "Sequential Logic & Finite State Machines",
    "h": 15,
    "w": "Memory and state are what turn logic into a computer.",
    "s": [
     "SR and D latches",
     "Flip-flops and edge triggering",
     "Registers and register files",
     "Counters",
     "Clocking, setup and hold time",
     "Moore and Mealy state machines",
     "Metastability and synchronizers"
    ],
    "r": [
     "Nand2Tetris chapter 3",
     "Harris & Harris chapter 3"
    ],
    "p": "Design a traffic-light controller FSM and simulate it."
   },
   {
    "id": "HW6",
    "t": "Hardware Description Languages & FPGAs",
    "h": 30,
    "w": "Real chips are written as code. FPGAs let you run your hardware for real.",
    "s": [
     "Verilog or VHDL syntax",
     "Combinational vs sequential blocks",
     "Testbenches and simulation",
     "Synthesis and what it produces",
     "FPGA architecture: LUTs, flip-flops, routing",
     "Timing constraints and closure"
    ],
    "r": [
     "HDLBits (interactive Verilog practice)",
     "Harris & Harris chapter 4",
     "Nandland FPGA tutorials"
    ],
    "p": "Implement a UART transmitter in Verilog, simulate it, and run it on a cheap FPGA board if you have one."
   },
   {
    "id": "HW7",
    "t": "Build a Computer from NAND",
    "h": 40,
    "w": "Finishing this makes the CPU stop being magic.",
    "s": [
     "RAM built from registers",
     "The program counter",
     "The Hack CPU",
     "The full Hack computer",
     "Machine language for Hack",
     "Writing an assembler"
    ],
    "r": [
     "Nand2Tetris Part I (Coursera / nand2tetris.org, free)",
     "Ben Eater's 8-bit breadboard computer series"
    ],
    "p": "Complete Nand2Tetris projects 1–6, including your own assembler."
   },
   {
    "id": "HW8",
    "t": "VLSI & Chip Design",
    "h": 35,
    "w": "How real chips are designed, verified and manufactured, from transistor layout to tape-out.",
    "s": [
     "Semiconductor physics basics: doping, PN junctions",
     "CMOS fabrication process",
     "Transistor sizing and logical effort",
     "Standard cells and layout",
     "The ASIC flow: RTL → synthesis → place and route → signoff",
     "Static timing analysis",
     "Power: dynamic vs leakage",
     "Design for test (scan chains)",
     "Open-source silicon: SkyWater PDK, OpenLane, Tiny Tapeout"
    ],
    "r": [
     "CMOS VLSI Design, Weste & Harris",
     "Tiny Tapeout (tinytapeout.com) tutorials",
     "Zero to ASIC course, Matt Venn"
    ],
    "p": "Design a small digital block (e.g. a PWM generator) and take it through OpenLane to a GDS layout, or submit it to Tiny Tapeout.",
    "pre": [
     "HW6"
    ]
   }
  ],
  "refs": [
   "OSSU: Nand2Tetris, Computation Structures",
   "CS2023: Architecture and Organization"
  ]
 },
 {
  "code": "AR",
  "name": "Computer Architecture",
  "layer": "Processor",
  "blurb": "How real CPUs execute instructions fast: ISAs, pipelines, caches, multicore and GPUs.",
  "topics": [
   {
    "id": "AR1",
    "t": "Instruction Sets & Assembly",
    "h": 30,
    "w": "Assembly is the language of reverse engineering and performance work.",
    "s": [
     "Registers and instruction formats",
     "Addressing modes",
     "RISC-V basics",
     "x86-64 basics",
     "ARM basics",
     "Calling conventions",
     "Stack frames and function calls",
     "Reading compiler output (Compiler Explorer)"
    ],
    "r": [
     "CS:APP chapter 3",
     "The RISC-V Reader, Patterson & Waterman",
     "Compiler Explorer (godbolt.org)"
    ],
    "p": "Write a few functions in RISC-V or x86-64 assembly and call them from C.",
    "pre": [
     "PR2",
     "HW7"
    ]
   },
   {
    "id": "AR2",
    "t": "Processor Design & Pipelining",
    "h": 30,
    "w": "Explains why some code runs 10× faster than equivalent code.",
    "s": [
     "Single-cycle datapath",
     "Control unit design",
     "Multi-cycle execution",
     "Five-stage pipeline",
     "Data, control and structural hazards",
     "Forwarding and stalling",
     "Branch prediction"
    ],
    "r": [
     "Computer Organization and Design (RISC-V edition), Patterson & Hennessy",
     "Onur Mutlu's Computer Architecture lectures (YouTube)"
    ],
    "p": "Write a cycle-accurate simulator of a 5-stage pipeline for a small RISC-V subset.",
    "pre": [
     "AR1"
    ]
   },
   {
    "id": "AR3",
    "t": "Memory Hierarchy",
    "h": 25,
    "w": "Memory, not compute, is the bottleneck in most programs and in AI training.",
    "s": [
     "SRAM vs DRAM",
     "Cache organization: lines, sets, ways",
     "Mapping and replacement policies",
     "Write-through vs write-back",
     "Locality and cache-friendly code",
     "Virtual memory, page tables and the TLB",
     "Cache coherence (MESI)"
    ],
    "r": [
     "CS:APP chapters 6 and 9",
     "What Every Programmer Should Know About Memory, Ulrich Drepper (free)"
    ],
    "p": "Benchmark matrix multiply with different loop orders and explain the speed differences with cache theory.",
    "pre": [
     "AR1"
    ]
   },
   {
    "id": "AR4",
    "t": "Advanced Architecture: Parallelism, Speculation & GPUs",
    "h": 30,
    "w": "Modern performance and modern AI hardware live here.",
    "s": [
     "Superscalar and out-of-order execution",
     "Speculative execution and Spectre/Meltdown",
     "SIMD and vector instructions",
     "Multicore and memory consistency",
     "GPU architecture: SIMT, warps, memory",
     "Accelerators: TPUs and NPUs"
    ],
    "r": [
     "Computer Architecture: A Quantitative Approach, Hennessy & Patterson",
     "Onur Mutlu lectures",
     "NVIDIA CUDA C Programming Guide (architecture chapters)"
    ],
    "p": "Vectorize a loop with SIMD intrinsics and measure the speedup.",
    "pre": [
     "AR2",
     "AR3"
    ]
   },
   {
    "id": "AR5",
    "t": "I/O, Buses & Storage",
    "h": 15,
    "w": "How data actually moves between CPU, disks, USB devices and networks.",
    "s": [
     "System buses and PCIe",
     "USB architecture (like your RTL-SDR)",
     "Interrupt-driven vs polled I/O",
     "Storage: HDD, SSD and NAND flash",
     "Memory-mapped I/O",
     "Device drivers overview"
    ],
    "r": [
     "CS:APP chapter 10",
     "OSTEP: I/O Devices and Hard Disk Drives chapters",
     "Linux Device Drivers, 3rd ed. (free)"
    ],
    "p": "Use lsusb, lspci and /sys to map every device in your laptop and Pi to its driver.",
    "pre": [
     "AR1"
    ]
   }
  ],
  "refs": [
   "Teach Yourself CS: Computer Architecture (CS:APP)",
   "roadmap.sh: Computer Science (how computers work)",
   "CS2023: Architecture and Organization, Systems Fundamentals"
  ],
  "branch": true
 },
 {
  "code": "DS",
  "name": "Data Structures & Algorithms",
  "layer": "Algorithm",
  "blurb": "The core toolkit for solving problems efficiently, and the basis of every technical interview.",
  "topics": [
   {
    "id": "DS1",
    "t": "Complexity Analysis",
    "h": 12,
    "w": "Lets you predict whether code will scale before you run it.",
    "s": [
     "Big-O, Big-Omega and Big-Theta",
     "Analyzing loops and recursion",
     "Recurrences and the master theorem",
     "Amortized analysis",
     "Space complexity"
    ],
    "r": [
     "Introduction to Algorithms (CLRS), chapters 1–4",
     "MIT 6.006 Introduction to Algorithms (OCW)"
    ],
    "p": "Time 5 algorithms at growing input sizes and fit their curves to the predicted complexity.",
    "pre": [
     "DM2"
    ]
   },
   {
    "id": "DS2",
    "t": "Linear Structures & Hashing",
    "h": 20,
    "w": "Arrays and hash tables are behind most fast code you'll write.",
    "s": [
     "Static and dynamic arrays",
     "Linked lists",
     "Stacks and queues",
     "Deques and circular buffers",
     "Hash functions",
     "Collision handling: chaining, open addressing",
     "Load factor and resizing"
    ],
    "r": [
     "CLRS chapters 10–11",
     "Algorithms, Sedgewick & Wayne (+ Coursera course)"
    ],
    "p": "Implement a hash map with open addressing and compare it to Python's dict."
   },
   {
    "id": "DS3",
    "t": "Trees & Heaps",
    "h": 30,
    "w": "Databases, file systems, compilers and schedulers all run on trees.",
    "s": [
     "Binary search trees",
     "Balanced trees: AVL and red-black",
     "Heaps and priority queues",
     "Tries",
     "B-trees and B+ trees",
     "Segment trees and Fenwick trees",
     "Union–find (disjoint sets)"
    ],
    "r": [
     "CLRS chapters 6, 12–13, 18, 19",
     "VisuAlgo (visualizations)"
    ],
    "p": "Implement a red-black tree or B-tree with insert, delete and search, plus property tests."
   },
   {
    "id": "DS4",
    "t": "Sorting & Searching",
    "h": 15,
    "w": "Classic patterns that show up inside almost every other algorithm.",
    "s": [
     "Insertion, merge and quick sort",
     "Heap sort",
     "The comparison-sort lower bound",
     "Counting and radix sort",
     "Binary search and its variants",
     "Quickselect"
    ],
    "r": [
     "CLRS chapters 2, 6–9",
     "Sedgewick & Wayne"
    ],
    "p": "Write a sorting visualizer that animates 5 algorithms side by side."
   },
   {
    "id": "DS5",
    "t": "Graph Algorithms",
    "h": 30,
    "w": "Routing, dependency resolution, social networks and compilers.",
    "s": [
     "BFS and DFS",
     "Topological sort",
     "Strongly connected components",
     "Dijkstra and Bellman–Ford",
     "Floyd–Warshall",
     "Minimum spanning trees: Kruskal and Prim",
     "Max flow and min cut",
     "Bipartite matching"
    ],
    "r": [
     "CLRS chapters 20–24",
     "MIT 6.006 and 6.046J",
     "Competitive Programmer's Handbook, Antti Laaksonen (free)"
    ],
    "p": "Build a route planner on real OpenStreetMap data for Charlotte.",
    "pre": [
     "DM3"
    ]
   },
   {
    "id": "DS6",
    "t": "Algorithm Design Paradigms",
    "h": 35,
    "w": "The techniques you reach for when facing a new problem.",
    "s": [
     "Divide and conquer",
     "Greedy algorithms and exchange arguments",
     "Dynamic programming: memoization and tabulation",
     "Classic DP: knapsack, LCS, edit distance",
     "Backtracking",
     "Branch and bound",
     "Randomized algorithms"
    ],
    "r": [
     "Algorithm Design, Kleinberg & Tardos",
     "CLRS chapters 14–15",
     "NeetCode 150 (practice list)"
    ],
    "p": "Solve 100 problems from NeetCode/LeetCode, tagged by paradigm."
   },
   {
    "id": "DS7",
    "t": "Advanced Algorithms",
    "h": 30,
    "w": "Strings, geometry and approximation show up in search engines, graphics and bioinformatics.",
    "s": [
     "String matching: KMP, Z-algorithm, Rabin–Karp",
     "Suffix arrays and suffix trees",
     "Computational geometry: convex hull, sweep line",
     "Approximation algorithms",
     "Online and streaming algorithms",
     "Bloom filters and sketches"
    ],
    "r": [
     "CLRS chapters 32–33, 35",
     "MIT 6.046J",
     "Algorithms, Jeff Erickson (free)"
    ],
    "p": "Implement a mini full-text search engine with an inverted index and a Bloom filter."
   }
  ],
  "refs": [
   "roadmap.sh: Data Structures & Algorithms, LeetCode",
   "OSSU: Core theory",
   "Teach Yourself CS: Algorithms",
   "CS2023: Algorithmic Foundations"
  ]
 },
 {
  "code": "MA",
  "name": "Continuous Math for AI",
  "layer": "Calculus",
  "blurb": "Linear algebra, calculus, probability and optimization: the language machine learning is written in. If you prefer, run it in parallel with Data Structures & Algorithms, a few sessions a week.",
  "topics": [
   {
    "id": "MA1",
    "t": "Linear Algebra",
    "h": 50,
    "w": "Data, images and neural network layers are all vectors and matrices.",
    "s": [
     "Vectors, dot products and norms",
     "Matrices as linear transformations",
     "Solving systems: Gaussian elimination",
     "Vector spaces, basis and rank",
     "Determinants",
     "Eigenvalues and eigenvectors",
     "Orthogonality, projections and least squares",
     "Singular value decomposition (SVD)",
     "Positive definite matrices"
    ],
    "r": [
     "MIT 18.06 Linear Algebra, Gilbert Strang (OCW)",
     "Essence of Linear Algebra, 3Blue1Brown",
     "Mathematics for Machine Learning, Deisenroth et al. (free)"
    ],
    "p": "Compress an image with SVD and plot quality versus rank."
   },
   {
    "id": "MA2",
    "t": "Single-Variable Calculus",
    "h": 35,
    "w": "Derivatives are how neural networks learn.",
    "s": [
     "Limits and continuity",
     "Derivatives and differentiation rules",
     "The chain rule",
     "Optimization with derivatives",
     "Integrals and the fundamental theorem",
     "Sequences and series",
     "Taylor series"
    ],
    "r": [
     "Essence of Calculus, 3Blue1Brown",
     "MIT 18.01 Single Variable Calculus (OCW)",
     "Calculus, Gilbert Strang (free)"
    ],
    "p": "Implement numerical differentiation and integration and compare against exact answers."
   },
   {
    "id": "MA3",
    "t": "Multivariable & Matrix Calculus",
    "h": 35,
    "w": "Backpropagation is the multivariable chain rule.",
    "s": [
     "Partial derivatives",
     "Gradients and directional derivatives",
     "Jacobians and Hessians",
     "Multivariable chain rule",
     "Matrix calculus identities",
     "Multiple integrals",
     "Lagrange multipliers"
    ],
    "r": [
     "MIT 18.02 Multivariable Calculus (OCW)",
     "Khan Academy Multivariable Calculus",
     "The Matrix Calculus You Need for Deep Learning, Parr & Howard (free)"
    ],
    "p": "Derive by hand, then verify numerically, the gradient of logistic regression's loss.",
    "pre": [
     "MA1",
     "MA2"
    ]
   },
   {
    "id": "MA4",
    "t": "Probability",
    "h": 40,
    "w": "ML models are probability distributions; uncertainty is everywhere in AI.",
    "s": [
     "Sample spaces and axioms",
     "Conditional probability and independence",
     "Bayes' theorem",
     "Random variables and distributions",
     "Bernoulli, binomial, Poisson, Gaussian, exponential",
     "Expectation, variance and covariance",
     "Joint, marginal and conditional distributions",
     "Law of large numbers and central limit theorem",
     "Markov chains"
    ],
    "r": [
     "Harvard Stat 110, Joe Blitzstein (free lectures + book)",
     "Seeing Theory (interactive)",
     "Introduction to Probability, Bertsekas & Tsitsiklis"
    ],
    "p": "Simulate the central limit theorem and a Markov chain text generator.",
    "pre": [
     "MA2"
    ]
   },
   {
    "id": "MA5",
    "t": "Statistics & Inference",
    "h": 30,
    "w": "How to learn from data and know when results are real.",
    "s": [
     "Estimators, bias and variance",
     "Maximum likelihood estimation",
     "MAP estimation and priors",
     "Confidence intervals",
     "Hypothesis testing and p-values",
     "Linear regression as statistics",
     "Bootstrap",
     "Bayesian inference basics",
     "A/B testing"
    ],
    "r": [
     "All of Statistics, Larry Wasserman",
     "Statistical Rethinking, Richard McElreath (lectures free)",
     "Think Stats, Allen Downey (free)"
    ],
    "p": "Run a full A/B test analysis on a public dataset, both frequentist and Bayesian.",
    "pre": [
     "MA4"
    ]
   },
   {
    "id": "MA6",
    "t": "Optimization",
    "h": 30,
    "w": "Training a model is solving an optimization problem.",
    "s": [
     "Convex sets and convex functions",
     "Gradient descent and convergence",
     "Newton's method",
     "Constrained optimization and KKT",
     "Duality basics",
     "Stochastic gradient descent",
     "Momentum, RMSProp and Adam",
     "Linear programming"
    ],
    "r": [
     "Convex Optimization, Boyd & Vandenberghe (free) + Stanford EE364A",
     "Distill: Why Momentum Really Works"
    ],
    "p": "Implement GD, momentum and Adam from scratch and visualize their paths on a 2-D loss surface.",
    "pre": [
     "MA3"
    ]
   },
   {
    "id": "MA7",
    "t": "Information Theory",
    "h": 15,
    "w": "Cross-entropy loss, KL divergence and compression come from here.",
    "s": [
     "Entropy",
     "Cross-entropy",
     "KL divergence",
     "Mutual information",
     "Source coding and Huffman codes",
     "Channel capacity",
     "Error-correcting codes: parity, Hamming, CRC, Reed–Solomon"
    ],
    "r": [
     "Information Theory, Inference, and Learning Algorithms, David MacKay (free)",
     "Visual Information Theory, Chris Olah (blog)"
    ],
    "p": "Build a Huffman compressor and compare its output size to the entropy bound.",
    "pre": [
     "MA4"
    ]
   },
   {
    "id": "MA8",
    "t": "Numerical Methods",
    "h": 20,
    "w": "Why training sometimes produces NaN, and how to compute stably.",
    "s": [
     "Floating point error and cancellation",
     "Conditioning and stability",
     "Root finding",
     "LU and QR decomposition",
     "Iterative solvers",
     "Numerical integration",
     "ODE solvers"
    ],
    "r": [
     "Numerical Linear Algebra, Trefethen & Bau",
     "Fast.ai Computational Linear Algebra (free)"
    ],
    "p": "Show a numerically unstable softmax, then fix it with the log-sum-exp trick.",
    "pre": [
     "MA1",
     "MA2"
    ]
   }
  ],
  "refs": [
   "OSSU: Calculus, Advanced math",
   "roadmap.sh: Machine Learning (math sections)",
   "CS2023: Mathematical and Statistical Foundations"
  ],
  "branch": true
 },
 {
  "code": "TC",
  "name": "Theory of Computation (Automata)",
  "layer": "Theory",
  "blurb": "What can be computed at all, and how efficiently. Automata also power regex, lexers and parsers.",
  "topics": [
   {
    "id": "TC1",
    "t": "Finite Automata & Regular Languages",
    "h": 25,
    "w": "Regex engines, lexers, protocol parsers and tokenizers are finite automata.",
    "s": [
     "Deterministic finite automata (DFA)",
     "Nondeterministic finite automata (NFA)",
     "Subset construction (NFA → DFA)",
     "Regular expressions and Thompson's construction",
     "Closure properties",
     "Pumping lemma for regular languages",
     "DFA minimization and Myhill–Nerode"
    ],
    "r": [
     "Introduction to the Theory of Computation, Michael Sipser, chapter 1",
     "Stanford Automata Theory, Jeffrey Ullman (free online)",
     "JFLAP (automata simulator)"
    ],
    "p": "Write a regex engine: regex → NFA → DFA → matcher.",
    "pre": [
     "DM1"
    ]
   },
   {
    "id": "TC2",
    "t": "Context-Free Grammars & Pushdown Automata",
    "h": 20,
    "w": "The theory behind every programming language parser and classic NLP parsing.",
    "s": [
     "Context-free grammars and derivations",
     "Parse trees and ambiguity",
     "Chomsky normal form",
     "Pushdown automata",
     "Equivalence of CFGs and PDAs",
     "CYK parsing",
     "Pumping lemma for context-free languages"
    ],
    "r": [
     "Sipser chapter 2",
     "Ullman's Automata course"
    ],
    "p": "Write a CYK parser for a small English grammar and print parse trees."
   },
   {
    "id": "TC3",
    "t": "Turing Machines & Computability",
    "h": 20,
    "w": "Defines the hard limits of what any program or AI can decide.",
    "s": [
     "Turing machines and variants",
     "The Church–Turing thesis",
     "Decidable and recognizable languages",
     "The halting problem",
     "Reductions",
     "Rice's theorem",
     "Universal machines"
    ],
    "r": [
     "Sipser chapters 3–5",
     "The Annotated Turing, Charles Petzold"
    ],
    "p": "Write a Turing machine simulator and run a binary increment and a palindrome checker on it."
   },
   {
    "id": "TC4",
    "t": "Computational Complexity",
    "h": 25,
    "w": "Tells you when to stop looking for a fast exact algorithm and approximate instead.",
    "s": [
     "Time complexity classes P and NP",
     "Polynomial-time reductions",
     "NP-completeness and Cook–Levin",
     "Classic NP-complete problems",
     "Space complexity and PSPACE",
     "Randomized classes (BPP)",
     "Hardness of approximation"
    ],
    "r": [
     "Sipser chapters 7–10",
     "Computational Complexity: A Modern Approach, Arora & Barak (free draft)"
    ],
    "p": "Reduce Sudoku to SAT and solve it with a SAT solver (e.g. PySAT)."
   }
  ],
  "refs": [
   "OSSU: Advanced theory",
   "CS2023: Algorithmic Foundations (computability)"
  ]
 },
 {
  "code": "SY",
  "name": "Systems Software",
  "layer": "System",
  "blurb": "Operating systems, compilers, networks, databases and distributed systems: the software everything else runs on.",
  "topics": [
   {
    "id": "SY1",
    "t": "Operating Systems",
    "h": 60,
    "w": "Processes, memory and files are what every program and exploit interacts with.",
    "s": [
     "Processes and the process API (fork, exec, wait)",
     "Threads",
     "CPU scheduling",
     "Locks, semaphores and condition variables",
     "Deadlock",
     "Virtual memory and paging",
     "Page replacement",
     "File systems and journaling",
     "System calls and kernel/user mode",
     "Inside a real kernel (xv6)"
    ],
    "r": [
     "Operating Systems: Three Easy Pieces (OSTEP, free)",
     "MIT 6.1810 Operating System Engineering (xv6 labs)",
     "Linux Kernel Development, Robert Love"
    ],
    "p": "Complete 4+ xv6 labs: system calls, page tables, traps and copy-on-write fork.",
    "pre": [
     "AR3"
    ]
   },
   {
    "id": "SY2",
    "t": "Concurrency & Parallel Programming",
    "h": 30,
    "w": "Every modern machine is parallel, and concurrency bugs are the hardest to find.",
    "s": [
     "Race conditions and critical sections",
     "Atomics and memory ordering",
     "Lock-free data structures",
     "Thread pools and work stealing",
     "async/await and event loops",
     "OpenMP and MPI",
     "Introduction to CUDA"
    ],
    "r": [
     "The Art of Multiprocessor Programming, Herlihy & Shavit",
     "Rust Atomics and Locks, Mara Bos (free online)",
     "CMU 15-418 Parallel Computer Architecture and Programming"
    ],
    "p": "Parallelize an image filter with threads, then with OpenMP, and measure scaling across cores.",
    "pre": [
     "SY1"
    ]
   },
   {
    "id": "SY3",
    "t": "Compilers & Interpreters",
    "h": 60,
    "w": "Shows how code becomes machine instructions, and uses automata theory directly.",
    "s": [
     "Lexical analysis",
     "Parsing: recursive descent, LL and LR",
     "Abstract syntax trees",
     "Semantic analysis and type checking",
     "Intermediate representations and SSA",
     "Optimizations: constant folding, inlining, dead code",
     "Code generation and register allocation",
     "Garbage collection",
     "JIT compilation"
    ],
    "r": [
     "Crafting Interpreters, Robert Nystrom (free)",
     "Engineering a Compiler, Cooper & Torczon",
     "Compilers: Principles, Techniques and Tools (Dragon Book)",
     "LLVM Kaleidoscope tutorial"
    ],
    "p": "Build a complete interpreter for a small language following Crafting Interpreters.",
    "pre": [
     "TC2",
     "PR2"
    ]
   },
   {
    "id": "SY4",
    "t": "Linkers, Loaders & Binary Formats",
    "h": 15,
    "w": "Essential groundwork for reverse engineering and exploitation.",
    "s": [
     "Object files and sections",
     "The ELF format (and PE on Windows)",
     "Symbol resolution",
     "Relocation",
     "Static vs dynamic linking",
     "PLT and GOT",
     "How the loader starts a process"
    ],
    "r": [
     "CS:APP chapter 7",
     "Linkers and Loaders, John Levine (free)",
     "readelf, objdump and nm manuals"
    ],
    "p": "Parse ELF headers and sections yourself in Python and compare against readelf.",
    "pre": [
     "PR2",
     "AR1"
    ]
   },
   {
    "id": "SY5",
    "t": "Computer Networks",
    "h": 45,
    "w": "Everything talks over networks; most security attacks travel over them.",
    "s": [
     "Layered models: OSI and TCP/IP",
     "Physical and link layers: Ethernet and Wi-Fi",
     "IP addressing, subnetting and NAT",
     "Routing: distance vector and link state, BGP",
     "UDP and TCP, reliability and flow control",
     "Congestion control",
     "DNS",
     "HTTP/1.1, HTTP/2 and HTTP/3",
     "TLS",
     "Socket programming"
    ],
    "r": [
     "Computer Networking: A Top-Down Approach, Kurose & Ross",
     "Beej's Guide to Network Programming (free)",
     "Stanford CS144 (build your own TCP)"
    ],
    "p": "Write your own HTTP server over raw sockets, then capture and explain its traffic in Wireshark.",
    "pre": [
     "SY1"
    ]
   },
   {
    "id": "SY6",
    "t": "Databases",
    "h": 40,
    "w": "Almost every application stores data; knowing internals lets you make it fast and correct.",
    "s": [
     "The relational model",
     "SQL: joins, aggregation, subqueries, window functions",
     "Normalization",
     "Storage and indexing: B+ trees and LSM trees",
     "Query processing and optimization",
     "Transactions and ACID",
     "Concurrency control: 2PL and MVCC",
     "Logging and recovery",
     "NoSQL models: key-value, document, graph"
    ],
    "r": [
     "CMU 15-445 Intro to Database Systems (Andy Pavlo, free)",
     "Database System Concepts, Silberschatz",
     "SQLBolt (practice)"
    ],
    "p": "Build a tiny key-value store with a write-ahead log and crash recovery.",
    "pre": [
     "SY1",
     "DS3"
    ]
   },
   {
    "id": "SY7",
    "t": "Distributed Systems",
    "h": 45,
    "w": "Cloud services and large-scale AI training are distributed systems.",
    "s": [
     "Failure models and partial failure",
     "Clocks: Lamport and vector clocks",
     "Replication",
     "Consensus: Paxos and Raft",
     "CAP and consistency models",
     "Partitioning and sharding",
     "MapReduce and dataflow",
     "Distributed transactions"
    ],
    "r": [
     "MIT 6.5840 Distributed Systems (labs in Go)",
     "Designing Data-Intensive Applications, Martin Kleppmann",
     "The Raft paper: In Search of an Understandable Consensus Algorithm"
    ],
    "p": "Implement Raft (MIT 6.5840 labs 3A–3C).",
    "pre": [
     "SY5",
     "SY6",
     "SY2"
    ]
   }
  ],
  "refs": [
   "Teach Yourself CS: OS, Networking, Databases, Compilers, Distributed Systems",
   "OSSU: Core systems, Advanced programming",
   "CS2023: Operating Systems, Networking, Data Management, Parallel and Distributed Computing"
  ],
  "branch": true
 },
 {
  "code": "SV",
  "name": "Servers & Infrastructure",
  "layer": "Server",
  "blurb": "Run real servers: Linux administration, network services, web stacks, storage, virtualization, automation, monitoring and the cloud.",
  "topics": [
   {
    "id": "SV1",
    "t": "Linux Server Administration",
    "h": 35,
    "w": "The everyday skill of keeping machines running, secure and updated.",
    "s": [
     "Users, sudo and SSH hardening",
     "systemd: services, timers, journald",
     "Package management and unattended upgrades",
     "Disks, partitions, LVM and mounting",
     "Filesystem choices: ext4, XFS, Btrfs",
     "Logs and log rotation",
     "Cron and scheduled jobs",
     "Performance triage: top, iostat, vmstat, ss",
     "Kernel parameters (sysctl)"
    ],
    "r": [
     "UNIX and Linux System Administration Handbook, Nemeth et al.",
     "Linux Upskill Challenge (free, 20 days)",
     "RHCSA study guides"
    ],
    "p": "Turn your Raspberry Pi into a properly managed server: hardened SSH, firewall, automatic updates, log alerts to Telegram.",
    "pre": [
     "SY1",
     "SY5"
    ]
   },
   {
    "id": "SV2",
    "t": "Network Services",
    "h": 25,
    "w": "The services every network depends on.",
    "s": [
     "DHCP",
     "DNS servers: authoritative vs recursive (BIND, Unbound)",
     "NTP and time sync",
     "Firewalls: nftables, iptables, ufw",
     "VPNs: WireGuard, OpenVPN, Tailscale",
     "VLANs and network segmentation",
     "Reverse DNS and email DNS records (SPF, DKIM, DMARC)",
     "Mail servers: SMTP, IMAP, deliverability"
    ],
    "r": [
     "DNS and BIND, Liu & Albitz",
     "WireGuard documentation",
     "Practical Networking (YouTube)"
    ],
    "p": "Run your own recursive DNS resolver (Unbound + Pi-hole) and a WireGuard VPN into your home network.",
    "pre": [
     "SV1"
    ]
   },
   {
    "id": "SV3",
    "t": "Network Engineering: Switching, Routing & Wireless",
    "h": 40,
    "w": "How real networks are designed and run, beyond the textbook layers.",
    "s": [
     "Switching: MAC tables, VLANs, trunking",
     "Spanning Tree Protocol and loop prevention",
     "Link aggregation",
     "Routing: static vs dynamic, OSPF, EIGRP",
     "BGP and how the internet is glued together",
     "First-hop redundancy: HSRP, VRRP",
     "QoS and traffic shaping",
     "Wi-Fi standards, channel planning and site surveys",
     "SD-WAN and MPLS overview",
     "Lab tools: Cisco Packet Tracer, GNS3, EVE-NG"
    ],
    "r": [
     "CCNA 200-301 Official Cert Guide, Wendell Odom",
     "Jeremy's IT Lab CCNA course (YouTube, free)",
     "roadmap.sh: Network Engineer roadmap"
    ],
    "p": "Build a multi-VLAN, multi-router network with OSPF and a BGP edge in GNS3 or Packet Tracer and document it.",
    "pre": [
     "SV1",
     "SY5"
    ]
   },
   {
    "id": "SV4",
    "t": "Network Automation",
    "h": 15,
    "w": "Configure hundreds of devices with code instead of by hand.",
    "s": [
     "Python for networking: netmiko and NAPALM",
     "NETCONF, RESTCONF and YANG models",
     "Ansible for network devices",
     "SNMP, NetFlow and sFlow telemetry",
     "Source-of-truth tools (NetBox)"
    ],
    "r": [
     "Network Programmability and Automation, Edelman, Lowe, Oswalt",
     "NetBox documentation"
    ],
    "p": "Write a script that backs up configs from every device in your lab and diffs them daily.",
    "pre": [
     "SV3"
    ]
   },
   {
    "id": "SV5",
    "t": "Windows Server & Active Directory",
    "h": 30,
    "w": "Most companies still run their identity and file services on Windows Server.",
    "s": [
     "Windows Server roles and features",
     "Active Directory: domains, forests, OUs",
     "Group Policy",
     "DNS and DHCP on Windows",
     "File servers, shares and NTFS permissions",
     "PowerShell for administration",
     "Hyper-V basics",
     "Azure AD / Entra ID and hybrid identity"
    ],
    "r": [
     "Microsoft Learn Windows Server paths (free)",
     "Learn Windows PowerShell in a Month of Lunches"
    ],
    "p": "Build a small AD domain in VMs (one DC, two clients) with Group Policy and file shares.",
    "pre": [
     "SV2"
    ]
   },
   {
    "id": "SV6",
    "t": "Web Servers, Proxies & Load Balancing",
    "h": 25,
    "w": "How websites and APIs are actually served at scale.",
    "s": [
     "nginx and Apache configuration",
     "Reverse proxies",
     "TLS certificates with Let's Encrypt",
     "Load balancing algorithms",
     "HAProxy",
     "Caching: HTTP caching, CDNs, Varnish",
     "Rate limiting",
     "WSGI/ASGI app servers (gunicorn, uvicorn)"
    ],
    "r": [
     "nginx official documentation and admin guide",
     "High Performance Browser Networking, Ilya Grigorik (free)",
     "HAProxy documentation"
    ],
    "p": "Serve two apps behind nginx with HTTPS on one domain, then load-balance one of them across two backends.",
    "pre": [
     "SV2"
    ]
   },
   {
    "id": "SV7",
    "t": "Server Hardware & Data Centers",
    "h": 15,
    "w": "What's physically inside a server rack and why it's built that way.",
    "s": [
     "Server CPUs, ECC memory and NUMA",
     "Rack units, power and cooling",
     "Out-of-band management: IPMI, iDRAC, iLO",
     "Redundancy: dual PSUs, RAID controllers, NICs",
     "Network gear: switches, routers, top-of-rack",
     "Data center design and tiers",
     "GPU servers for AI"
    ],
    "r": [
     "ServeTheHome (reviews and articles)",
     "The Datacenter as a Computer, Barroso, Hölzle, Ranganathan (free)"
    ],
    "p": "Spec a 4-server homelab or small-business rack with a budget, power and cooling estimate.",
    "pre": [
     "SV1"
    ]
   },
   {
    "id": "SV8",
    "t": "Storage Systems",
    "h": 25,
    "w": "Keeping data safe, fast and recoverable.",
    "s": [
     "RAID levels and tradeoffs",
     "ZFS: pools, datasets, snapshots, scrubs",
     "NAS vs SAN",
     "NFS and SMB file sharing",
     "iSCSI block storage",
     "Object storage (S3, MinIO, Ceph)",
     "Backup strategy: 3-2-1, restic, borg",
     "Disaster recovery and restore testing"
    ],
    "r": [
     "FreeBSD Mastery: ZFS, Lucas & Jude",
     "OpenZFS documentation",
     "restic and BorgBackup documentation"
    ],
    "p": "Set up nightly encrypted backups of your laptop to the Pi with restic, and prove a full restore works.",
    "pre": [
     "SV1"
    ]
   },
   {
    "id": "SV9",
    "t": "Virtualization & Homelab",
    "h": 25,
    "w": "Run many servers on one machine to practise everything safely.",
    "s": [
     "Hypervisors: type 1 vs type 2",
     "KVM and QEMU",
     "Proxmox VE",
     "VM networking: bridges and NAT",
     "Templates, snapshots and cloning",
     "LXC containers",
     "Building a homelab"
    ],
    "r": [
     "Proxmox VE documentation",
     "r/homelab wiki",
     "Learn Linux TV (YouTube)"
    ],
    "p": "Install Proxmox on an old PC and run a small lab: DNS, a web server, a database and a monitoring VM.",
    "pre": [
     "SV1"
    ]
   },
   {
    "id": "SV10",
    "t": "Automation & Configuration Management",
    "h": 20,
    "w": "Never configure the same server by hand twice.",
    "s": [
     "Idempotency and desired state",
     "Ansible: inventories, playbooks, roles",
     "Templates and secrets (Ansible Vault)",
     "Cloud-init",
     "Infrastructure as code with Terraform",
     "GitOps"
    ],
    "r": [
     "Ansible for DevOps, Jeff Geerling",
     "Terraform: Up & Running, Yevgeniy Brikman",
     "Jeff Geerling's Ansible 101 (YouTube)"
    ],
    "p": "Write an Ansible playbook that rebuilds your Pi's whole setup (bot, DNS, backups) from a fresh SD card.",
    "pre": [
     "SV1"
    ]
   },
   {
    "id": "SV11",
    "t": "Monitoring, Logging & SRE",
    "h": 25,
    "w": "Knowing a service is broken before your users tell you.",
    "s": [
     "Metrics vs logs vs traces",
     "Prometheus and exporters",
     "Grafana dashboards",
     "Centralized logging (Loki or ELK)",
     "Alerting and on-call",
     "SLIs, SLOs and error budgets",
     "Incident response and postmortems",
     "Capacity planning"
    ],
    "r": [
     "Site Reliability Engineering, Google (free)",
     "The Site Reliability Workbook (free)",
     "Prometheus documentation"
    ],
    "p": "Monitor your Pi and laptop with Prometheus and Grafana, with alerts routed to Telegram.",
    "pre": [
     "SV1"
    ]
   },
   {
    "id": "SV12",
    "t": "Cloud, Containers & Orchestration",
    "h": 35,
    "w": "How most production software is deployed today.",
    "s": [
     "Cloud models: IaaS, PaaS, SaaS, serverless",
     "Core AWS/GCP/Azure services",
     "Containers in depth: namespaces and cgroups",
     "Docker and docker compose",
     "Kubernetes: pods, deployments, services, ingress",
     "Helm",
     "CI/CD pipelines (GitHub Actions)",
     "Cost management"
    ],
    "r": [
     "Kubernetes official tutorials",
     "AWS Cloud Practitioner Essentials (free)",
     "Docker Deep Dive, Nigel Poulton",
     "The Twelve-Factor App"
    ],
    "p": "Run a 3-node k3s cluster (the Pi can be a node), deploy a service with Helm, and wire up CI/CD from GitHub.",
    "pre": [
     "SV9",
     "SV6"
    ]
   },
   {
    "id": "SV13",
    "t": "DevOps & Platform Engineering",
    "h": 30,
    "w": "Ship software many times a day, safely.",
    "s": [
     "CI/CD pipelines in depth",
     "Deployment strategies: blue/green, canary, feature flags",
     "GitOps with Argo CD or Flux",
     "Secrets management (Vault, SOPS)",
     "Artifact and container registries",
     "Service mesh (Istio, Linkerd)",
     "Platform engineering and internal developer platforms",
     "FinOps: tracking and cutting cloud cost"
    ],
    "r": [
     "The DevOps Handbook, Kim et al.",
     "Accelerate, Forsgren, Humble, Kim",
     "roadmap.sh: DevOps roadmap",
     "Argo CD documentation"
    ],
    "p": "Set up GitOps for your k3s cluster: every push to GitHub deploys automatically with a canary rollout.",
    "pre": [
     "SV12",
     "SV10"
    ]
   }
  ],
  "refs": [
   "roadmap.sh: Linux, DevOps, Network Engineer, Cloud Computing, Docker, Kubernetes, AWS, Terraform",
   "CS2023: Networking and Communication"
  ],
  "branch": true
 },
 {
  "code": "EM",
  "name": "Embedded Systems & Microcontrollers",
  "layer": "Device",
  "blurb": "Program the chips inside everything: microcontrollers, peripherals, real-time systems, embedded Linux, IoT, PCBs and control.",
  "topics": [
   {
    "id": "EM1",
    "t": "Microcontroller Architecture",
    "h": 20,
    "w": "Know the chip before you program it: cores, memory maps and clocks.",
    "s": [
     "MCU vs CPU vs SoC",
     "ARM Cortex-M architecture (M0, M4, M7)",
     "AVR (Arduino), RP2040 (Pico) and ESP32 families",
     "Memory map: flash, SRAM, peripheral registers",
     "Clock trees, PLLs and oscillators",
     "Reset sequence and the vector table",
     "Reading a datasheet and reference manual",
     "Choosing an MCU for a project"
    ],
    "r": [
     "The Definitive Guide to ARM Cortex-M3/M4, Joseph Yiu",
     "RP2040 datasheet (Raspberry Pi)",
     "Embedded Systems – Shape the World (UT Austin, edX)"
    ],
    "p": "Write a one-page comparison of the RP2040, ESP32 and an STM32, from their datasheets, for a sensor project.",
    "pre": [
     "AR1",
     "PR2"
    ]
   },
   {
    "id": "EM2",
    "t": "Bare-Metal Programming",
    "h": 30,
    "w": "Code that runs with no operating system underneath, directly on registers.",
    "s": [
     "Toolchains: arm-none-eabi-gcc and cross-compiling",
     "Startup code and linker scripts",
     "Memory-mapped registers and volatile",
     "GPIO from registers (no libraries)",
     "Interrupts and the NVIC",
     "SysTick and hardware timers",
     "Flashing and debugging with SWD/JTAG (OpenOCD, gdb)",
     "Hardware abstraction layers (HAL) vs registers"
    ],
    "r": [
     "Making Embedded Systems, Elecia White",
     "Bare-metal programming guide (cpq/bare-metal-programming-guide on GitHub)",
     "Raspberry Pi Pico C/C++ SDK documentation"
    ],
    "p": "Blink an LED on a Pico or STM32 with no SDK: your own startup file, linker script and register code.",
    "pre": [
     "EM1"
    ]
   },
   {
    "id": "EM3",
    "t": "Peripherals & Communication Protocols",
    "h": 30,
    "w": "How chips talk to sensors, displays, radios and each other.",
    "s": [
     "UART serial communication",
     "SPI",
     "I2C",
     "ADC sampling and resolution",
     "DAC and PWM output",
     "DMA transfers",
     "CAN bus (cars and industry)",
     "USB device basics",
     "Logic analyzers and oscilloscopes for debugging"
    ],
    "r": [
     "Sparkfun and Adafruit protocol tutorials",
     "Making Embedded Systems, chapters 4–7",
     "Saleae Logic analyzer guides"
    ],
    "p": "Read a temperature/pressure sensor over I2C and an SPI display, and capture both buses with a logic analyzer.",
    "pre": [
     "EM2"
    ]
   },
   {
    "id": "EM4",
    "t": "Real-Time Operating Systems",
    "h": 25,
    "w": "Deterministic timing for drones, medical devices and cars.",
    "s": [
     "Hard vs soft real-time",
     "Tasks, priorities and preemptive scheduling",
     "Queues, semaphores and mutexes",
     "Priority inversion and inheritance",
     "Timing analysis and jitter",
     "FreeRTOS in practice",
     "Zephyr RTOS overview"
    ],
    "r": [
     "Mastering the FreeRTOS Real Time Kernel (free PDF)",
     "Zephyr Project documentation",
     "Digi-Key's Introduction to RTOS (YouTube)"
    ],
    "p": "Run a FreeRTOS app with 3 tasks (sensor, display, logging) sharing data through queues.",
    "pre": [
     "EM2",
     "SY1"
    ]
   },
   {
    "id": "EM5",
    "t": "Embedded Linux & Device Drivers",
    "h": 40,
    "w": "Routers, cameras, the Raspberry Pi and most IoT gateways run embedded Linux.",
    "s": [
     "Boot process: bootloader (U-Boot), kernel, rootfs",
     "Cross-compiling the Linux kernel",
     "Device tree",
     "Building images with Buildroot and Yocto",
     "Writing a kernel module",
     "Character device drivers",
     "GPIO, I2C and SPI from Linux userspace",
     "Real-time Linux (PREEMPT_RT)"
    ],
    "r": [
     "Mastering Embedded Linux Programming, Chris Simmonds",
     "Bootlin free training materials (embedded Linux and kernel)",
     "Linux Device Drivers, 3rd ed. (free)"
    ],
    "p": "Build a minimal Buildroot image for your Raspberry Pi and write a kernel module that exposes a sensor as /dev/mysensor.",
    "pre": [
     "EM3",
     "SY1"
    ]
   },
   {
    "id": "EM6",
    "t": "IoT & Wireless",
    "h": 25,
    "w": "Connecting devices to each other and to servers.",
    "s": [
     "Wi-Fi on microcontrollers (ESP32)",
     "Bluetooth Low Energy: GATT, services, characteristics",
     "LoRa and LoRaWAN",
     "Zigbee, Thread and Matter",
     "MQTT and pub/sub messaging",
     "Over-the-air (OTA) updates",
     "IoT security: secure boot, TLS, key storage"
    ],
    "r": [
     "ESP-IDF programming guide",
     "Getting Started with Bluetooth Low Energy, Townsend et al.",
     "The Things Network documentation (LoRaWAN)"
    ],
    "p": "Build an ESP32 sensor that publishes over MQTT to a broker on your Pi, with readings sent to your Telegram bot.",
    "pre": [
     "EM3"
    ]
   },
   {
    "id": "EM7",
    "t": "PCB Design & Electronics Prototyping",
    "h": 30,
    "w": "Turning a breadboard into a real product.",
    "s": [
     "Schematic capture",
     "Component selection and footprints",
     "PCB layout and routing",
     "Ground planes, decoupling and signal integrity",
     "Design rule checks",
     "Ordering boards (JLCPCB, PCBWay)",
     "Soldering, including SMD",
     "Bring-up and debugging a new board"
    ],
    "r": [
     "KiCad official documentation and Getting Started guide",
     "Phil's Lab (YouTube)",
     "Robert Feranec's PCB design videos"
    ],
    "p": "Design a custom board in KiCad (e.g. an ESP32 sensor board), order 5 copies and bring one up.",
    "pre": [
     "EM3",
     "HW1"
    ]
   },
   {
    "id": "EM8",
    "t": "Low-Power & Reliable Embedded Design",
    "h": 15,
    "w": "Battery life and devices that never hang.",
    "s": [
     "Sleep modes and wake sources",
     "Measuring current (power profilers)",
     "Battery chemistry and power budgets",
     "Watchdog timers",
     "Brown-out detection",
     "Bootloaders and safe firmware updates",
     "Fault handling and logging"
    ],
    "r": [
     "Memfault Interrupt blog",
     "Making Embedded Systems, chapter 10",
     "Nordic Semiconductor power-optimization guides"
    ],
    "p": "Make a battery sensor node that lasts 6+ months on a coin cell or AA pack, with your measurements proving it.",
    "pre": [
     "EM2"
    ]
   },
   {
    "id": "EM9",
    "t": "Control Systems & Robotics Basics",
    "h": 30,
    "w": "Making physical things move precisely: motors, drones, robot arms.",
    "s": [
     "Feedback control and block diagrams",
     "PID control and tuning",
     "Motor types: DC, stepper, servo, BLDC",
     "Motor drivers and H-bridges",
     "Encoders and sensor fusion (IMU, complementary/Kalman filter)",
     "Kinematics basics",
     "ROS 2 overview"
    ],
    "r": [
     "Control Bootcamp, Steve Brunton (YouTube)",
     "Feedback Systems, Åström & Murray (free)",
     "ROS 2 official tutorials"
    ],
    "p": "Build a self-balancing robot or a PID-controlled motor speed controller.",
    "pre": [
     "EM2",
     "MA2"
    ]
   },
   {
    "id": "EM10",
    "t": "Industrial & Automotive Embedded Systems",
    "h": 25,
    "w": "Factories, power grids and cars run on their own protocols and safety rules.",
    "s": [
     "PLCs and ladder logic",
     "Modbus, Profinet and industrial Ethernet",
     "SCADA and ICS architecture",
     "CAN, CAN FD and automotive networks (LIN, FlexRay)",
     "AUTOSAR overview",
     "Functional safety: IEC 61508 and ISO 26262",
     "ICS security basics"
    ],
    "r": [
     "Programmable Logic Controllers, Frank Petruzella",
     "CSS Electronics CAN bus guides",
     "OpenPLC project"
    ],
    "p": "Run OpenPLC on your Pi, control an output over Modbus, and sniff a CAN bus with a cheap adapter.",
    "pre": [
     "EM3"
    ]
   }
  ],
  "refs": [
   "CS2023: Specialized Platform Development, Architecture and Organization",
   "OSSU: Internet of Things, Modern Robotics"
  ],
  "branch": true
 },
 {
  "code": "SE",
  "name": "Software Engineering",
  "layer": "Craft",
  "blurb": "Building software that is correct, maintainable and fast, alone and in teams.",
  "topics": [
   {
    "id": "SE1",
    "t": "Software Design & Architecture",
    "h": 25,
    "w": "Separates code that survives from code that gets rewritten.",
    "s": [
     "Modularity, coupling and cohesion",
     "Design patterns in practice",
     "Layered and hexagonal architecture",
     "API design: REST and gRPC",
     "Domain modeling",
     "Refactoring safely"
    ],
    "r": [
     "A Philosophy of Software Design, John Ousterhout",
     "Refactoring, Martin Fowler",
     "Designing Data-Intensive Applications (architecture chapters)"
    ],
    "p": "Refactor your Telegram bot into clean modules with a plugin system for features.",
    "pre": [
     "PR3"
    ]
   },
   {
    "id": "SE2",
    "t": "Software Process, Requirements & Modeling",
    "h": 15,
    "w": "How teams decide what to build and keep a project on track.",
    "s": [
     "Software development life cycles: waterfall, iterative, agile",
     "Scrum and Kanban in practice",
     "Requirements and user stories",
     "Estimation",
     "UML: class, sequence, use-case, state and activity diagrams",
     "Architecture decision records"
    ],
    "r": [
     "Software Engineering, Ian Sommerville",
     "Scrum Guide (free)",
     "UML Distilled, Martin Fowler"
    ],
    "p": "Write requirements, a sequence diagram and a class diagram for your Telegram bot.",
    "pre": [
     "SE1"
    ]
   },
   {
    "id": "SE3",
    "t": "API Design",
    "h": 20,
    "w": "APIs are the contracts between every service you'll build or use.",
    "s": [
     "REST principles and resource modeling",
     "HTTP methods, status codes and headers",
     "Pagination, filtering and sorting",
     "Versioning strategies",
     "Idempotency and retries",
     "Authentication: API keys, OAuth 2.0, OIDC, JWT",
     "Rate limiting",
     "GraphQL, gRPC and webhooks",
     "OpenAPI documentation and contract testing"
    ],
    "r": [
     "roadmap.sh: API Design roadmap",
     "Designing Web APIs, Jin, Sahni, Shevat",
     "Google API Design Guide (free)"
    ],
    "p": "Design and document an OpenAPI spec for your learning tracker, then implement it with FastAPI.",
    "pre": [
     "SE1",
     "SY5"
    ]
   },
   {
    "id": "SE4",
    "t": "System Design Fundamentals",
    "h": 35,
    "w": "How to design services that serve millions of users, and the core of senior interviews.",
    "s": [
     "Back-of-the-envelope estimation",
     "Latency vs throughput, availability in nines",
     "Horizontal vs vertical scaling",
     "Load balancers (L4 vs L7)",
     "Caching layers and strategies: cache-aside, write-through, write-behind",
     "CDNs",
     "Database scaling: replication, sharding, federation, denormalization",
     "Message queues and async processing",
     "Consistency patterns: strong, eventual, weak",
     "Designing classic systems: URL shortener, chat, feed, rate limiter"
    ],
    "r": [
     "System Design Interview, Alex Xu (vols 1–2)",
     "The System Design Primer (GitHub, free)",
     "roadmap.sh: System Design roadmap",
     "Designing Data-Intensive Applications"
    ],
    "p": "Write full designs for 5 classic systems, with diagrams and capacity estimates.",
    "pre": [
     "SE3",
     "SY7"
    ]
   },
   {
    "id": "SE5",
    "t": "Distributed Architecture & Cloud Design Patterns",
    "h": 25,
    "w": "Proven patterns that keep distributed systems reliable.",
    "s": [
     "Monolith vs microservices",
     "Event-driven architecture",
     "CQRS and event sourcing",
     "Saga and compensating transactions",
     "Circuit breaker, retry, bulkhead, throttling",
     "Sidecar, ambassador and API gateway",
     "Strangler fig migrations",
     "Service discovery and health checks"
    ],
    "r": [
     "Azure Architecture Center: Cloud Design Patterns (free)",
     "Building Microservices, Sam Newman",
     "Microservices Patterns, Chris Richardson"
    ],
    "p": "Split one feature of your bot into an event-driven service with a queue, retries and a circuit breaker.",
    "pre": [
     "SE4"
    ]
   },
   {
    "id": "SE6",
    "t": "Testing & Code Quality",
    "h": 20,
    "w": "Tests let you change code without fear.",
    "s": [
     "Unit, integration and end-to-end tests",
     "Test-driven development",
     "Mocks and fakes",
     "Property-based testing (Hypothesis)",
     "Fuzzing",
     "Coverage and its limits",
     "Linters, formatters and static analysis",
     "Systematic debugging: reproduce, bisect, isolate"
    ],
    "r": [
     "Python Testing with pytest, Brian Okken",
     "Hypothesis documentation",
     "Google's Software Engineering at Google, chapters 11–14 (free)"
    ],
    "p": "Add a test suite to your bot's reminder parser, including property-based tests.",
    "pre": [
     "SE1"
    ]
   },
   {
    "id": "SE7",
    "t": "Web Development",
    "h": 45,
    "w": "The web is the default way to ship software to people.",
    "s": [
     "HTML and accessible markup",
     "CSS layout: flexbox and grid",
     "JavaScript and the DOM",
     "HTTP from the application's side",
     "A frontend framework (React)",
     "A backend framework (FastAPI or Node)",
     "Authentication and sessions",
     "Deployment",
     "How browsers work: parsing, rendering, the JS engine",
     "Web performance (Core Web Vitals)"
    ],
    "r": [
     "The Odin Project (free)",
     "MDN Web Docs",
     "Full Stack Open, University of Helsinki (free)"
    ],
    "p": "Build a web dashboard for your learning progress that reads from your Pi.",
    "pre": [
     "SE3"
    ]
   },
   {
    "id": "SE8",
    "t": "Performance Engineering",
    "h": 20,
    "w": "Turns hardware knowledge into real speedups.",
    "s": [
     "Profiling: perf, flame graphs, py-spy",
     "Benchmarking methodology",
     "Cache-aware data layout",
     "Vectorization",
     "Parallel speedup and Amdahl's law",
     "Memory allocation costs"
    ],
    "r": [
     "MIT 6.172 Performance Engineering of Software Systems (OCW)",
     "Brendan Gregg's performance resources",
     "Systems Performance, Brendan Gregg"
    ],
    "p": "Take a slow Python program, profile it and make it 50× faster (NumPy, C extension or Rust).",
    "pre": [
     "SE1",
     "AR3"
    ]
   }
  ],
  "refs": [
   "roadmap.sh: System Design, API Design, Software Architect, Backend, Frontend, Full Stack, QA",
   "OSSU: Core programming, Core applications",
   "CS2023: Software Engineering, HCI"
  ],
  "branch": true
 },
 {
  "code": "DE",
  "name": "Data Engineering & Big Data",
  "layer": "Pipeline",
  "blurb": "Moving, storing and processing data at scale: the plumbing under analytics and machine learning.",
  "topics": [
   {
    "id": "DE1",
    "t": "Data Modeling & Warehousing",
    "h": 25,
    "w": "How analytics data is organized so questions can be answered fast.",
    "s": [
     "OLTP vs OLAP",
     "Dimensional modeling: facts and dimensions",
     "Star and snowflake schemas",
     "Slowly changing dimensions",
     "Data warehouses (BigQuery, Snowflake, Redshift)",
     "Data lakes and lakehouses (Delta Lake, Iceberg)",
     "Columnar formats: Parquet and ORC"
    ],
    "r": [
     "The Data Warehouse Toolkit, Ralph Kimball",
     "Fundamentals of Data Engineering, Reis & Housley",
     "roadmap.sh: Data Engineer roadmap"
    ],
    "p": "Design a star schema for a public dataset and load it into DuckDB.",
    "pre": [
     "SY6"
    ]
   },
   {
    "id": "DE2",
    "t": "Batch Processing & Spark",
    "h": 25,
    "w": "Processing terabytes when one machine is not enough.",
    "s": [
     "MapReduce and HDFS ideas",
     "Apache Spark: RDDs, DataFrames, Spark SQL",
     "Partitioning and shuffles",
     "Joins at scale",
     "Performance tuning",
     "Distributed file and object storage"
    ],
    "r": [
     "Learning Spark, Damji et al.",
     "Spark official documentation"
    ],
    "p": "Process a multi-gigabyte public dataset with PySpark and profile where the time goes.",
    "pre": [
     "DE1",
     "SY7"
    ]
   },
   {
    "id": "DE3",
    "t": "Streaming & Messaging",
    "h": 25,
    "w": "Real-time data: clicks, sensors, payments as they happen.",
    "s": [
     "Messages vs streams",
     "Apache Kafka: topics, partitions, consumer groups",
     "RabbitMQ and other brokers",
     "Exactly-once and idempotency",
     "Stream processing: windows, watermarks (Flink, Kafka Streams)",
     "Change data capture (Debezium)"
    ],
    "r": [
     "Kafka: The Definitive Guide",
     "Streaming Systems, Akidau, Chernyak, Lax"
    ],
    "p": "Stream your Pi's sensor or internet-watchdog data through Kafka into a live dashboard.",
    "pre": [
     "DE1",
     "SY7"
    ]
   },
   {
    "id": "DE4",
    "t": "Pipelines, Orchestration & Data Quality",
    "h": 20,
    "w": "Keeping thousands of data jobs correct and on schedule.",
    "s": [
     "ETL vs ELT vs reverse ETL",
     "Orchestration with Airflow, Dagster or Prefect",
     "Transformations with dbt",
     "Data quality tests",
     "Lineage and metadata catalogs",
     "Data governance and privacy (GDPR)",
     "Data mesh and data contracts"
    ],
    "r": [
     "Fundamentals of Data Engineering",
     "dbt Learn (free)",
     "Airflow documentation"
    ],
    "p": "Build a daily pipeline (Airflow + dbt) that pulls data from an API, tests it and loads a warehouse.",
    "pre": [
     "DE2"
    ]
   },
   {
    "id": "DE5",
    "t": "Specialized Databases & Search",
    "h": 25,
    "w": "Picking the right store: cache, time series, graph, vector or search index.",
    "s": [
     "Key-value and caches: Redis, Memcached",
     "Document stores: MongoDB",
     "Wide-column stores: Cassandra",
     "Time-series databases: InfluxDB, TimescaleDB",
     "Graph databases: Neo4j",
     "Vector databases and approximate nearest neighbor search",
     "Search engines: inverted index, BM25, Elasticsearch/OpenSearch",
     "Learning to rank"
    ],
    "r": [
     "Seven Databases in Seven Weeks",
     "Introduction to Information Retrieval, Manning et al. (free)",
     "Elasticsearch: The Definitive Guide"
    ],
    "p": "Add full-text and vector search to your notes, and compare BM25 with embedding search.",
    "pre": [
     "DE1"
    ]
   }
  ],
  "refs": [
   "roadmap.sh: Data Engineer, SQL, PostgreSQL, MongoDB, Redis, Elasticsearch",
   "OSSU: Big Data, Data Mining",
   "CS2023: Data Management"
  ],
  "branch": true
 },
 {
  "code": "SC",
  "name": "Security & Reverse Engineering",
  "layer": "Adversary",
  "blurb": "Think like an attacker: cryptography, exploitation, reverse engineering, malware and hardware hacking.",
  "topics": [
   {
    "id": "SC1",
    "t": "Security Fundamentals",
    "h": 15,
    "w": "The vocabulary and mindset for everything else in this phase.",
    "s": [
     "Confidentiality, integrity, availability",
     "Threat modeling (STRIDE)",
     "Authentication and authorization",
     "Access control models",
     "Common vulnerability classes (CWE)",
     "Secure coding principles",
     "Legal and ethical rules: only test what you own or are authorized to"
    ],
    "r": [
     "Security Engineering, Ross Anderson (free online)",
     "CS 161 Computer Security, UC Berkeley (free notes)"
    ],
    "p": "Write a threat model for your Raspberry Pi setup and fix the top 3 risks.",
    "pre": [
     "SY5"
    ]
   },
   {
    "id": "SC2",
    "t": "Cryptography",
    "h": 40,
    "w": "Protects every connection you make; misusing it is a common real-world bug.",
    "s": [
     "Classical ciphers and why they break",
     "Symmetric ciphers: AES and block modes",
     "Stream ciphers",
     "Hash functions",
     "MACs and authenticated encryption",
     "Public-key crypto: RSA and Diffie–Hellman",
     "Elliptic curve cryptography",
     "Digital signatures",
     "PKI, certificates and TLS",
     "Randomness",
     "Post-quantum cryptography overview"
    ],
    "r": [
     "Cryptography I, Dan Boneh (Coursera, free to audit)",
     "Serious Cryptography, Jean-Philippe Aumasson",
     "The Cryptopals Crypto Challenges"
    ],
    "p": "Complete Cryptopals sets 1–3.",
    "pre": [
     "SC1",
     "DM2",
     "DM4"
    ]
   },
   {
    "id": "SC3",
    "t": "Network & Web Security",
    "h": 35,
    "w": "Most real attacks hit web apps and networks.",
    "s": [
     "Packet capture and analysis with Wireshark",
     "Scanning with nmap",
     "Firewalls and segmentation",
     "OWASP Top 10",
     "SQL injection",
     "Cross-site scripting (XSS) and CSRF",
     "SSRF and access-control bugs",
     "Authentication and session flaws"
    ],
    "r": [
     "PortSwigger Web Security Academy (free)",
     "OWASP Top 10",
     "TryHackMe and Hack The Box (beginner paths)"
    ],
    "p": "Finish the PortSwigger apprentice labs and write up 5 of them.",
    "pre": [
     "SC1",
     "SY5",
     "SE7"
    ]
   },
   {
    "id": "SC4",
    "t": "Identity & Access Management",
    "h": 20,
    "w": "Most breaches start with stolen or misused identities.",
    "s": [
     "Authentication factors and MFA",
     "Password storage: hashing, salting, bcrypt/argon2",
     "Kerberos and NTLM",
     "LDAP and Active Directory security",
     "SSO: SAML, OAuth 2.0 and OpenID Connect",
     "Zero-trust architecture",
     "Privileged access management"
    ],
    "r": [
     "Solving Identity Management in Modern Applications, Wilson & Hingnikar",
     "OAuth 2.0 Simplified, Aaron Parecki"
    ],
    "p": "Add OAuth login to a web app and attack your own setup for common OAuth mistakes.",
    "pre": [
     "SC3"
    ]
   },
   {
    "id": "SC5",
    "t": "Binary Exploitation",
    "h": 50,
    "w": "Shows exactly how memory-safety bugs become full control of a machine.",
    "s": [
     "Process memory layout",
     "Stack buffer overflows",
     "Shellcode",
     "Format string bugs",
     "Heap exploitation basics",
     "Return-oriented programming (ROP)",
     "Mitigations: ASLR, NX, canaries, PIE, CFI",
     "Bypassing mitigations"
    ],
    "r": [
     "pwn.college (Arizona State, free)",
     "Hacking: The Art of Exploitation, Jon Erickson",
     "Nightmare (binary exploitation course, free on GitHub)"
    ],
    "p": "Complete pwn.college's memory errors and ROP modules.",
    "pre": [
     "SC1",
     "AR1",
     "SY4",
     "PR2"
    ]
   },
   {
    "id": "SC6",
    "t": "Windows Internals",
    "h": 25,
    "w": "Most malware and many exploits target Windows; you need to know how it works inside.",
    "s": [
     "Processes, threads and handles",
     "The Windows API and native API",
     "Memory management and the PE loader",
     "The registry",
     "Services and scheduled tasks",
     "Security tokens, privileges and UAC",
     "Event logs and ETW",
     "PowerShell for analysis"
    ],
    "r": [
     "Windows Internals, 7th ed., Yosifovich et al.",
     "Sysinternals tools and Mark Russinovich's talks"
    ],
    "p": "Use Process Monitor and Process Explorer to trace exactly what a program does on startup.",
    "pre": [
     "SC1",
     "SY1"
    ]
   },
   {
    "id": "SC7",
    "t": "Reverse Engineering",
    "h": 50,
    "w": "Understand software without source code: malware, firmware, protocols, games.",
    "s": [
     "Reading x86-64 and ARM disassembly fluently",
     "Recognizing compiler patterns: loops, switches, structs",
     "Static analysis with Ghidra (or IDA, radare2)",
     "Decompiler output and its pitfalls",
     "Dynamic analysis with gdb/pwndbg and x64dbg",
     "Anti-debugging and obfuscation",
     "Patching binaries",
     "Reversing file formats and network protocols"
    ],
    "r": [
     "Practical Reverse Engineering, Dang, Gazet, Bachaalany",
     "Ghidra official courses",
     "crackmes.one (practice)",
     "Reverse Engineering for Beginners, Dennis Yurichev (free)"
    ],
    "p": "Solve 20 crackmes of increasing difficulty and document your approach for each.",
    "pre": [
     "SC5"
    ]
   },
   {
    "id": "SC8",
    "t": "Penetration Testing & Red Teaming",
    "h": 40,
    "w": "A structured way to find weaknesses before attackers do, legally and in scope.",
    "s": [
     "Rules of engagement, scope and legal authorization",
     "Reconnaissance and OSINT",
     "Scanning and enumeration",
     "Exploitation frameworks (Metasploit)",
     "Active Directory attacks: kerberoasting, pass-the-hash",
     "Post-exploitation and lateral movement",
     "Command-and-control concepts",
     "Writing a professional report"
    ],
    "r": [
     "The Hacker Playbook 3, Peter Kim",
     "Hack The Box Academy and TryHackMe paths",
     "OSCP / PNPT syllabus as a checklist"
    ],
    "p": "Fully compromise 10 retired Hack The Box machines and write a report for each.",
    "pre": [
     "SC3",
     "SC4",
     "SC5"
    ]
   },
   {
    "id": "SC9",
    "t": "Malware Analysis",
    "h": 40,
    "w": "Defensive security work depends on understanding what malware does.",
    "s": [
     "Safe lab setup: isolated VMs and snapshots",
     "PE format in depth",
     "Static triage: strings, imports, hashes",
     "Dynamic analysis in a sandbox",
     "Packers and unpacking",
     "Persistence and evasion techniques",
     "Writing YARA rules",
     "Reporting indicators of compromise"
    ],
    "r": [
     "Practical Malware Analysis, Sikorski & Honig",
     "MalwareBazaar and theZoo (samples, handle with care)",
     "FLARE-VM setup guide"
    ],
    "p": "Analyze an old, well-documented malware sample in an isolated VM and write a full report.",
    "pre": [
     "SC7",
     "SC6"
    ]
   },
   {
    "id": "SC10",
    "t": "Hardware, Firmware & RF Security",
    "h": 35,
    "w": "Connects the bottom of the stack to security, including your RTL-SDR.",
    "s": [
     "Finding UART, JTAG and SWD on boards",
     "Firmware extraction and analysis (binwalk)",
     "Embedded Linux exploitation",
     "Side-channel attacks: timing and power",
     "Fault injection basics",
     "Software-defined radio fundamentals",
     "Capturing and decoding RF protocols"
    ],
    "r": [
     "The Hardware Hacking Handbook, van Woudenberg & O'Flynn",
     "Practical IoT Hacking",
     "Great Scott Gadgets SDR lessons (free)"
    ],
    "p": "Capture and decode a 433 MHz device you own with your RTL-SDR and rtl_433, then document the protocol.",
    "pre": [
     "SC7",
     "EM3"
    ]
   },
   {
    "id": "SC11",
    "t": "Wireless & Mobile Security",
    "h": 20,
    "w": "Wi-Fi, Bluetooth and phones are everywhere and often weakly protected.",
    "s": [
     "WEP, WPA2 and WPA3 and how each is attacked",
     "Evil twin and rogue access points",
     "Bluetooth and BLE security",
     "NFC and RFID",
     "Android security model and app analysis",
     "iOS security model overview",
     "Mobile app reverse engineering (jadx, Frida)"
    ],
    "r": [
     "OWASP Mobile Application Security Testing Guide (free)",
     "Hacking Exposed Wireless"
    ],
    "p": "Audit your own Wi-Fi with the aircrack-ng suite, then reverse engineer one Android app you use.",
    "pre": [
     "SC3",
     "SC7"
    ]
   },
   {
    "id": "SC12",
    "t": "OS Security & Forensics",
    "h": 30,
    "w": "Completes the picture: privilege, persistence and investigation.",
    "s": [
     "Linux privilege escalation",
     "Windows privilege escalation basics",
     "Sandboxing and isolation",
     "Kernel exploitation concepts",
     "System hardening",
     "Disk and memory forensics (Volatility)",
     "Log analysis and incident response"
    ],
    "r": [
     "HackTricks (free)",
     "The Art of Memory Forensics",
     "TryHackMe privilege escalation rooms"
    ],
    "p": "Harden your Pi against a checklist (CIS benchmark), then try to break your own hardening.",
    "pre": [
     "SC6",
     "SV1"
    ]
   },
   {
    "id": "SC13",
    "t": "Defensive Operations: SOC, Detection & Threat Intel",
    "h": 30,
    "w": "The blue-team side: finding and stopping attacks in progress.",
    "s": [
     "Security operations center (SOC) workflow",
     "SIEM: collecting and correlating logs",
     "IDS/IPS (Suricata, Zeek)",
     "Endpoint detection and response (EDR)",
     "MITRE ATT&CK and the cyber kill chain",
     "Threat intelligence and OSINT",
     "Threat hunting",
     "Incident response lifecycle and runbooks",
     "Honeypots"
    ],
    "r": [
     "Blue Team Handbook, Don Murdoch",
     "MITRE ATT&CK website",
     "Security Onion documentation",
     "TryHackMe SOC Level 1 path"
    ],
    "p": "Run Security Onion or Wazuh in your homelab, attack a VM, and write detection rules that catch it.",
    "pre": [
     "SC12",
     "SC3"
    ]
   },
   {
    "id": "SC14",
    "t": "Cloud & Container Security",
    "h": 20,
    "w": "Most infrastructure now runs in the cloud, with new failure modes.",
    "s": [
     "Shared responsibility model",
     "Cloud IAM and least privilege",
     "Misconfigurations: public buckets, open ports",
     "Container and image security",
     "Kubernetes security (RBAC, network policies, pod security)",
     "Secrets in the cloud",
     "Cloud logging and detection"
    ],
    "r": [
     "Hacking the Cloud (wiki, free)",
     "flAWS and flAWS2 challenges",
     "Kubernetes Security, Rice & Hausenblas"
    ],
    "p": "Complete flAWS and flAWS2, then harden your own k3s cluster.",
    "pre": [
     "SC4",
     "SV12"
    ]
   },
   {
    "id": "SC15",
    "t": "Governance, Risk & Compliance",
    "h": 15,
    "w": "How organizations decide what to protect and prove they did it.",
    "s": [
     "Risk assessment and risk management",
     "Security frameworks: NIST CSF, ISO 27001, CIS Controls",
     "Policies, standards and procedures",
     "Privacy law: GDPR, CCPA, HIPAA",
     "Industry standards: PCI DSS, SOC 2",
     "Audits and evidence",
     "Business continuity and disaster recovery"
    ],
    "r": [
     "NIST Cybersecurity Framework (free)",
     "CISSP Official Study Guide (as a reference)"
    ],
    "p": "Write a one-page security policy and risk register for a small (imaginary) company.",
    "pre": [
     "SC1"
    ]
   }
  ],
  "refs": [
   "roadmap.sh: Cyber Security, DevSecOps",
   "OSSU: Core security, Advanced information security",
   "CS2023: Security"
  ],
  "branch": true
 },
 {
  "code": "SP",
  "name": "Signals & Image Processing",
  "layer": "Signal",
  "blurb": "The CVIP foundation: signals, Fourier analysis and classical image processing and vision.",
  "topics": [
   {
    "id": "SP1",
    "t": "Signals, Systems & DSP",
    "h": 40,
    "w": "The math of audio, radio (your RTL-SDR), images and convolution.",
    "s": [
     "Continuous and discrete signals",
     "Linear time-invariant systems",
     "Convolution",
     "Fourier series and Fourier transform",
     "DFT and FFT",
     "Sampling theorem and aliasing",
     "Z-transform",
     "FIR and IIR filter design"
    ],
    "r": [
     "Think DSP, Allen Downey (free)",
     "MIT 6.003 Signals and Systems (OCW)",
     "The Scientist and Engineer's Guide to DSP, Steven Smith (free)"
    ],
    "p": "Demodulate FM radio from your RTL-SDR's raw IQ samples in NumPy and play the audio.",
    "pre": [
     "MA2",
     "MA1"
    ]
   },
   {
    "id": "SP2",
    "t": "Communication Systems & Software-Defined Radio",
    "h": 30,
    "w": "How Wi-Fi, cellular, GPS and radio actually send bits through the air, using your RTL-SDR.",
    "s": [
     "Analog modulation: AM and FM",
     "Digital modulation: ASK, FSK, PSK, QAM",
     "OFDM (Wi-Fi, LTE, 5G)",
     "Noise, SNR and link budgets",
     "Antennas and propagation",
     "Synchronization and demodulation",
     "GNU Radio flowgraphs",
     "Decoding real signals: ADS-B, weather satellites, pagers"
    ],
    "r": [
     "PySDR: A Guide to SDR and DSP using Python (free)",
     "Software-Defined Radio for Engineers, Collins et al. (free)",
     "GNU Radio tutorials"
    ],
    "p": "Decode ADS-B aircraft messages from raw RTL-SDR samples with your own Python demodulator.",
    "pre": [
     "SP1"
    ]
   },
   {
    "id": "SP3",
    "t": "Digital Image Fundamentals",
    "h": 15,
    "w": "What an image actually is to a computer.",
    "s": [
     "Image formation and the pinhole camera",
     "Sampling and quantization",
     "Color spaces: RGB, HSV, YCbCr, Lab",
     "Histograms and contrast",
     "Point operations and gamma"
    ],
    "r": [
     "Digital Image Processing, Gonzalez & Woods, chapters 1–3",
     "OpenCV-Python tutorials"
    ],
    "p": "Write histogram equalization from scratch and compare with OpenCV's.",
    "pre": [
     "SP1"
    ]
   },
   {
    "id": "SP4",
    "t": "Image Processing",
    "h": 35,
    "w": "Filtering, edges and segmentation are still used in every vision pipeline.",
    "s": [
     "Spatial filtering and convolution kernels",
     "Smoothing and sharpening",
     "Frequency-domain filtering",
     "Morphological operations",
     "Edge detection: Sobel and Canny",
     "Thresholding and Otsu's method",
     "Segmentation: region growing, watershed",
     "Image restoration and denoising",
     "Compression: DCT and JPEG"
    ],
    "r": [
     "Gonzalez & Woods, chapters 3–10",
     "Computerphile image processing videos"
    ],
    "p": "Build a document scanner: detect the page edges, warp it flat and threshold it.",
    "pre": [
     "SP3"
    ]
   },
   {
    "id": "SP5",
    "t": "Classical Computer Vision",
    "h": 40,
    "w": "Geometry-based vision still powers AR, robotics, mapping and calibration.",
    "s": [
     "Feature detectors: Harris, SIFT, ORB",
     "Feature matching",
     "RANSAC",
     "Homographies and image stitching",
     "Camera models and calibration",
     "Epipolar geometry",
     "Stereo and depth",
     "Optical flow",
     "Structure from motion"
    ],
    "r": [
     "Computer Vision: Algorithms and Applications, Richard Szeliski (free)",
     "Multiple View Geometry, Hartley & Zisserman",
     "First Principles of Computer Vision, Shree Nayar (YouTube)"
    ],
    "p": "Write a panorama stitcher from scratch using ORB features and RANSAC.",
    "pre": [
     "SP4",
     "MA1"
    ]
   }
  ],
  "refs": [
   "CS2023: Graphics and Interactive Techniques",
   "Classic EE/CS image-processing courses"
  ],
  "branch": true
 },
 {
  "code": "ML",
  "name": "Machine Learning",
  "layer": "Model",
  "blurb": "Learning from data: classic models, evaluation, and the theory of why learning works.",
  "topics": [
   {
    "id": "ML1",
    "t": "Classical AI: Search, Logic & Planning",
    "h": 35,
    "w": "The foundations of AI before learning: search, reasoning and planning, still used in games, robotics and agents.",
    "s": [
     "Intelligent agents and environments",
     "Uninformed search: BFS, DFS, uniform cost",
     "Heuristic search: A* and admissible heuristics",
     "Adversarial search: minimax, alpha-beta, MCTS",
     "Constraint satisfaction problems",
     "Propositional and first-order logic for reasoning",
     "Knowledge representation",
     "Classical planning (STRIPS, PDDL)",
     "Probabilistic reasoning and Bayesian networks"
    ],
    "r": [
     "Artificial Intelligence: A Modern Approach, Russell & Norvig",
     "UC Berkeley CS188 Introduction to AI (Pac-Man projects, free)"
    ],
    "p": "Complete the Berkeley CS188 Pac-Man search and multi-agent projects.",
    "pre": [
     "DS5",
     "DM1",
     "MA4"
    ]
   },
   {
    "id": "ML2",
    "t": "Machine Learning Fundamentals",
    "h": 30,
    "w": "The concepts every ML project depends on, whatever the model.",
    "s": [
     "Supervised vs unsupervised learning",
     "Train, validation and test splits",
     "Bias–variance tradeoff",
     "Overfitting and regularization",
     "Cross-validation",
     "Metrics: accuracy, precision, recall, F1, ROC-AUC",
     "Feature engineering",
     "Data leakage"
    ],
    "r": [
     "Machine Learning Specialization, Andrew Ng (Coursera)",
     "An Introduction to Statistical Learning with Python (ISLP, free)",
     "Google's Machine Learning Crash Course"
    ],
    "p": "Enter a Kaggle Getting Started competition and beat the baseline.",
    "pre": [
     "MA5",
     "PR1"
    ]
   },
   {
    "id": "ML3",
    "t": "Data Tooling for ML",
    "h": 20,
    "w": "Most ML time is spent on data, not models.",
    "s": [
     "NumPy arrays and broadcasting",
     "pandas DataFrames",
     "Data cleaning and missing values",
     "Visualization with matplotlib and seaborn",
     "scikit-learn pipelines",
     "Jupyter workflow",
     "Exploratory data analysis and data storytelling",
     "SQL for analytics"
    ],
    "r": [
     "Python Data Science Handbook, Jake VanderPlas (free)",
     "Kaggle Learn micro-courses",
     "scikit-learn user guide"
    ],
    "p": "Clean and explore a messy real dataset and publish the notebook.",
    "pre": [
     "ML2"
    ]
   },
   {
    "id": "ML4",
    "t": "Linear Models",
    "h": 20,
    "w": "The building block inside every neural network.",
    "s": [
     "Linear regression: closed form and gradient descent",
     "Polynomial features",
     "Logistic regression",
     "Softmax regression",
     "L1 and L2 regularization",
     "Generalized linear models"
    ],
    "r": [
     "ISLP chapters 3–4",
     "CS229 lecture notes, Stanford (free)"
    ],
    "p": "Implement linear and logistic regression in pure NumPy and match scikit-learn's results.",
    "pre": [
     "ML3",
     "MA3"
    ]
   },
   {
    "id": "ML5",
    "t": "Classical Algorithms",
    "h": 30,
    "w": "Gradient-boosted trees still win most tabular-data problems.",
    "s": [
     "k-nearest neighbors",
     "Naive Bayes",
     "Decision trees",
     "Random forests",
     "Gradient boosting: XGBoost and LightGBM",
     "Support vector machines and kernels",
     "Ensembling and stacking"
    ],
    "r": [
     "ISLP chapters 8–9",
     "Hands-On Machine Learning, Aurélien Géron",
     "StatQuest (YouTube)"
    ],
    "p": "Write a decision tree from scratch, then compare it with XGBoost on the same data.",
    "pre": [
     "ML4"
    ]
   },
   {
    "id": "ML6",
    "t": "Unsupervised Learning",
    "h": 25,
    "w": "Finding structure without labels: clustering, compression and anomalies.",
    "s": [
     "k-means",
     "Gaussian mixture models and EM",
     "Hierarchical clustering",
     "DBSCAN",
     "Principal component analysis",
     "t-SNE and UMAP",
     "Anomaly detection"
    ],
    "r": [
     "ISLP chapter 12",
     "Pattern Recognition and Machine Learning, Bishop, chapter 9"
    ],
    "p": "Detect anomalies in your Pi's internet-outage or sensor logs.",
    "pre": [
     "ML5"
    ]
   },
   {
    "id": "ML7",
    "t": "Recommender Systems",
    "h": 20,
    "w": "Behind every feed, store and streaming service.",
    "s": [
     "Content-based filtering",
     "Collaborative filtering",
     "Matrix factorization",
     "Implicit feedback",
     "Two-tower and deep recommenders",
     "Evaluation: precision@k, NDCG, online tests",
     "Cold start and exploration"
    ],
    "r": [
     "Recommender Systems Handbook",
     "Google's Recommendation Systems course (free)"
    ],
    "p": "Build a movie recommender on MovieLens and compare 3 approaches.",
    "pre": [
     "ML6",
     "MA1"
    ]
   },
   {
    "id": "ML8",
    "t": "Time Series & Forecasting",
    "h": 20,
    "w": "Forecasting demand, prices, traffic and sensor readings.",
    "s": [
     "Trend, seasonality and stationarity",
     "Autocorrelation",
     "ARIMA and exponential smoothing",
     "Prophet-style models",
     "ML and deep learning for time series",
     "Backtesting properly",
     "Anomaly detection in time series"
    ],
    "r": [
     "Forecasting: Principles and Practice, Hyndman & Athanasopoulos (free)",
     "sktime and statsmodels docs"
    ],
    "p": "Forecast your Pi's internet speed or a sensor reading a day ahead and measure the error.",
    "pre": [
     "ML5",
     "MA5"
    ]
   },
   {
    "id": "ML9",
    "t": "Causal Inference",
    "h": 20,
    "w": "Telling cause from correlation, which is central to experiments, policy and science.",
    "s": [
     "Correlation vs causation",
     "Potential outcomes and counterfactuals",
     "Causal graphs (DAGs) and confounders",
     "Randomized experiments",
     "Matching and propensity scores",
     "Difference-in-differences and instrumental variables",
     "Uplift modeling"
    ],
    "r": [
     "Causal Inference: The Mixtape, Scott Cunningham (free)",
     "The Book of Why, Pearl & Mackenzie",
     "Causal Inference for the Brave and True (free)"
    ],
    "p": "Estimate a causal effect on a public observational dataset two ways and compare.",
    "pre": [
     "ML2",
     "MA5"
    ]
   },
   {
    "id": "ML10",
    "t": "Explainability & Fairness",
    "h": 15,
    "w": "Understanding why a model decided something, and whether it treats people fairly.",
    "s": [
     "Global vs local explanations",
     "Feature importance and permutation importance",
     "SHAP",
     "LIME",
     "Partial dependence plots",
     "Fairness metrics and their tradeoffs",
     "Bias auditing"
    ],
    "r": [
     "Interpretable Machine Learning, Christoph Molnar (free)",
     "Fairness and Machine Learning, Barocas, Hardt, Narayanan (free)"
    ],
    "p": "Explain a gradient-boosted model's predictions with SHAP and audit it for bias.",
    "pre": [
     "ML5"
    ]
   },
   {
    "id": "ML11",
    "t": "Probabilistic Machine Learning",
    "h": 35,
    "w": "The framework behind generative models, uncertainty and Bayesian methods.",
    "s": [
     "Bayesian networks",
     "Hidden Markov models",
     "Sampling: MCMC",
     "Variational inference",
     "Gaussian processes",
     "Probabilistic programming (PyMC)"
    ],
    "r": [
     "Probabilistic Machine Learning, Kevin Murphy (free)",
     "Bishop PRML chapters 8, 10–11",
     "Probabilistic Programming and Bayesian Methods for Hackers (free)"
    ],
    "p": "Build an HMM part-of-speech tagger, then a Bayesian model in PyMC.",
    "pre": [
     "ML6",
     "MA4"
    ]
   },
   {
    "id": "ML12",
    "t": "Learning Theory",
    "h": 20,
    "w": "Explains why models generalize, and when they won't.",
    "s": [
     "PAC learning",
     "VC dimension",
     "Generalization bounds",
     "No free lunch theorem",
     "Rademacher complexity",
     "Double descent and modern puzzles"
    ],
    "r": [
     "Understanding Machine Learning, Shalev-Shwartz & Ben-David (free)",
     "Stanford CS229T notes"
    ],
    "p": "Reproduce a double-descent curve with polynomial or random-feature regression.",
    "pre": [
     "ML5",
     "MA4"
    ]
   }
  ],
  "refs": [
   "roadmap.sh: Machine Learning, AI and Data Scientist, Data Analyst",
   "OSSU: Machine Learning",
   "CS2023: Artificial Intelligence"
  ],
  "branch": true
 },
 {
  "code": "DL",
  "name": "Deep Learning (Neural Networks)",
  "layer": "Network",
  "blurb": "Neural networks from a single neuron to transformers and generative models, built from scratch first.",
  "topics": [
   {
    "id": "DL1",
    "t": "Neural Network Basics",
    "h": 30,
    "w": "Building a network by hand removes the mystery from everything after it.",
    "s": [
     "Perceptron",
     "Multi-layer perceptron",
     "Activation functions",
     "Loss functions",
     "Computational graphs",
     "Backpropagation by hand",
     "Writing an autograd engine"
    ],
    "r": [
     "Neural Networks: Zero to Hero, Andrej Karpathy (micrograd lecture)",
     "Neural Networks series, 3Blue1Brown",
     "Neural Networks and Deep Learning, Michael Nielsen (free)"
    ],
    "p": "Build micrograd from scratch and train an MLP with it.",
    "pre": [
     "MA3",
     "ML4"
    ]
   },
   {
    "id": "DL2",
    "t": "Training Deep Networks",
    "h": 30,
    "w": "Most of practical deep learning is making training work.",
    "s": [
     "Weight initialization",
     "Optimizers in practice: SGD, momentum, Adam",
     "Learning-rate schedules and warmup",
     "Batch norm and layer norm",
     "Dropout and weight decay",
     "Gradient clipping",
     "Diagnosing training: loss curves, activations",
     "Hyperparameter search"
    ],
    "r": [
     "Deep Learning, Goodfellow, Bengio & Courville (free), chapters 6–8",
     "Karpathy: A Recipe for Training Neural Networks",
     "Karpathy makemore lectures"
    ],
    "p": "Train a character-level language model and document every trick that improved it.",
    "pre": [
     "DL1"
    ]
   },
   {
    "id": "DL3",
    "t": "PyTorch & Deep Learning Engineering",
    "h": 25,
    "w": "The standard tool for research and production deep learning.",
    "s": [
     "Tensors and GPU devices",
     "Autograd",
     "nn.Module and building models",
     "Datasets and DataLoaders",
     "Training loops and checkpointing",
     "Mixed precision",
     "Logging with TensorBoard or Weights & Biases"
    ],
    "r": [
     "Official PyTorch tutorials",
     "Dive into Deep Learning (d2l.ai, free)",
     "Deep Learning with PyTorch, Stevens et al."
    ],
    "p": "Port your micrograd MLP to PyTorch and train it on a GPU (Colab or Kaggle).",
    "pre": [
     "DL2"
    ]
   },
   {
    "id": "DL4",
    "t": "Convolutional Neural Networks",
    "h": 30,
    "w": "The architecture that started the deep learning boom in vision.",
    "s": [
     "Convolution layers",
     "Pooling and stride",
     "Receptive fields",
     "LeNet, AlexNet and VGG",
     "Residual networks (ResNet)",
     "Transfer learning and fine-tuning",
     "Visualizing what CNNs learn"
    ],
    "r": [
     "Stanford CS231n (lectures and notes, free)",
     "d2l.ai chapters 7–8"
    ],
    "p": "Train a CNN on CIFAR-10 to above 90% accuracy.",
    "pre": [
     "DL3",
     "SP4"
    ]
   },
   {
    "id": "DL5",
    "t": "Sequence Models",
    "h": 20,
    "w": "The bridge from classic NLP to attention.",
    "s": [
     "Recurrent neural networks",
     "Backpropagation through time",
     "Vanishing gradients",
     "LSTM and GRU",
     "Sequence-to-sequence models",
     "Bahdanau attention"
    ],
    "r": [
     "d2l.ai chapters 9–10",
     "Colah's blog: Understanding LSTM Networks",
     "CS224n RNN lectures"
    ],
    "p": "Build a seq2seq model with attention for date-format translation.",
    "pre": [
     "DL3"
    ]
   },
   {
    "id": "DL6",
    "t": "Transformers",
    "h": 40,
    "w": "The architecture behind GPT, Claude, ViT and most modern AI.",
    "s": [
     "Self-attention",
     "Queries, keys and values",
     "Multi-head attention",
     "Positional encodings (sinusoidal, RoPE)",
     "Encoder, decoder and encoder–decoder",
     "Pre-norm vs post-norm",
     "Causal masking",
     "Building GPT from scratch"
    ],
    "r": [
     "Attention Is All You Need (paper)",
     "Karpathy: Let's build GPT from scratch, and nanoGPT",
     "The Illustrated Transformer, Jay Alammar",
     "The Annotated Transformer, Harvard NLP"
    ],
    "p": "Write a GPT from scratch and train it on a text corpus of your choice.",
    "pre": [
     "DL5"
    ]
   },
   {
    "id": "DL7",
    "t": "Generative Models",
    "h": 40,
    "w": "How AI creates images, audio and text.",
    "s": [
     "Autoencoders",
     "Variational autoencoders",
     "Generative adversarial networks",
     "Normalizing flows",
     "Diffusion models (DDPM)",
     "Score-based models",
     "Classifier-free guidance",
     "Evaluating generative models"
    ],
    "r": [
     "Understanding Deep Learning, Simon Prince (free), chapters 14–18",
     "Lilian Weng's blog posts on diffusion and VAEs",
     "Hugging Face Diffusion Models course"
    ],
    "p": "Train a small DDPM on MNIST or faces and generate new samples.",
    "pre": [
     "DL4",
     "MA4"
    ]
   },
   {
    "id": "DL8",
    "t": "Self-Supervised & Representation Learning",
    "h": 25,
    "w": "How models learn from unlabeled data at internet scale.",
    "s": [
     "Embeddings and representation spaces",
     "Contrastive learning (SimCLR)",
     "CLIP",
     "Masked modeling: BERT and MAE",
     "Knowledge distillation",
     "Evaluating representations"
    ],
    "r": [
     "Lilian Weng: Self-Supervised Representation Learning",
     "The CLIP and MAE papers",
     "Understanding Deep Learning, chapter 14"
    ],
    "p": "Train a small contrastive model and visualize its embeddings with UMAP.",
    "pre": [
     "DL6",
     "DL4"
    ]
   },
   {
    "id": "DL9",
    "t": "Graph Neural Networks",
    "h": 20,
    "w": "Learning on molecules, social networks, maps and knowledge graphs.",
    "s": [
     "Graph representation learning",
     "Message passing",
     "GCN, GraphSAGE and GAT",
     "Node, edge and graph-level tasks",
     "Knowledge graph embeddings",
     "PyTorch Geometric"
    ],
    "r": [
     "Stanford CS224W Machine Learning with Graphs (free)",
     "Graph Representation Learning, William Hamilton (free)"
    ],
    "p": "Train a GNN for node classification on a citation dataset.",
    "pre": [
     "DL3",
     "DM3"
    ]
   }
  ],
  "refs": [
   "roadmap.sh: Machine Learning (deep learning sections)",
   "CS2023: Artificial Intelligence"
  ],
  "branch": true
 },
 {
  "code": "CV",
  "name": "Computer Vision with Deep Learning",
  "layer": "Vision",
  "blurb": "The CVIP finish: modern recognition, detection, segmentation, 3D and generative vision.",
  "topics": [
   {
    "id": "CV1",
    "t": "Modern Image Classification",
    "h": 20,
    "w": "The backbone models every other vision task builds on.",
    "s": [
     "Data augmentation",
     "EfficientNet and modern CNN design",
     "Vision Transformers (ViT)",
     "ConvNeXt",
     "Training recipes and regularization",
     "Robustness and distribution shift"
    ],
    "r": [
     "CS231n",
     "timm library documentation",
     "The ViT paper: An Image Is Worth 16x16 Words"
    ],
    "p": "Fine-tune a ViT on your own photo dataset and analyze its errors.",
    "pre": [
     "DL4",
     "DL6"
    ]
   },
   {
    "id": "CV2",
    "t": "Object Detection",
    "h": 30,
    "w": "Self-driving, retail, security cameras and robotics all detect objects.",
    "s": [
     "Bounding boxes and IoU",
     "Two-stage detectors: R-CNN family",
     "One-stage detectors: YOLO and SSD",
     "Anchors and anchor-free detection",
     "Non-max suppression",
     "DETR (transformer detection)",
     "Evaluation with mAP"
    ],
    "r": [
     "CS231n detection lecture",
     "Ultralytics YOLO documentation",
     "The DETR paper"
    ],
    "p": "Train a YOLO detector on a custom dataset and run it live on a webcam or the Pi camera.",
    "pre": [
     "CV1"
    ]
   },
   {
    "id": "CV3",
    "t": "Segmentation",
    "h": 25,
    "w": "Pixel-level understanding for medicine, mapping and editing.",
    "s": [
     "Semantic segmentation: FCN",
     "U-Net",
     "Instance segmentation: Mask R-CNN",
     "Panoptic segmentation",
     "Segment Anything (SAM)",
     "Evaluation metrics"
    ],
    "r": [
     "U-Net and SAM papers",
     "Hugging Face segmentation guides"
    ],
    "p": "Train a U-Net on a medical or satellite segmentation dataset.",
    "pre": [
     "CV1"
    ]
   },
   {
    "id": "CV4",
    "t": "Video & 3D Vision",
    "h": 35,
    "w": "Moving from flat images to motion and the 3D world.",
    "s": [
     "Video classification and action recognition",
     "Multi-object tracking",
     "Monocular depth estimation",
     "Point clouds and PointNet",
     "Neural radiance fields (NeRF)",
     "3D Gaussian splatting",
     "SLAM overview"
    ],
    "r": [
     "Szeliski chapters 11–14",
     "The NeRF and 3D Gaussian Splatting papers",
     "Nerfstudio documentation"
    ],
    "p": "Reconstruct a room or object in 3D from phone video with Nerfstudio or Gaussian splatting.",
    "pre": [
     "CV2",
     "SP5"
    ]
   },
   {
    "id": "CV5",
    "t": "Generative Vision",
    "h": 25,
    "w": "Text-to-image, editing and super-resolution.",
    "s": [
     "Latent diffusion (Stable Diffusion)",
     "Conditioning and ControlNet",
     "Inpainting and image editing",
     "Super-resolution",
     "Fine-tuning with LoRA and DreamBooth",
     "Detecting generated images"
    ],
    "r": [
     "Hugging Face diffusers documentation",
     "The Latent Diffusion Models paper"
    ],
    "p": "Fine-tune a small diffusion model with LoRA on a style or object of your choice.",
    "pre": [
     "DL7",
     "CV1"
    ]
   },
   {
    "id": "CV6",
    "t": "Vision–Language Models",
    "h": 25,
    "w": "Models that see and talk: the basis of multimodal assistants.",
    "s": [
     "CLIP and zero-shot classification",
     "Image captioning",
     "Visual question answering",
     "Multimodal LLM architectures (LLaVA style)",
     "Grounding and referring expressions",
     "Evaluating multimodal models"
    ],
    "r": [
     "The CLIP, BLIP-2 and LLaVA papers",
     "Hugging Face multimodal course material"
    ],
    "p": "Build a photo search app: type a sentence and find matching images with CLIP embeddings.",
    "pre": [
     "DL8",
     "CV1"
    ]
   }
  ],
  "refs": [
   "Stanford CS231n",
   "CS2023: Artificial Intelligence, Graphics and Interactive Techniques"
  ],
  "branch": true
 },
 {
  "code": "NL",
  "name": "Natural Language Processing",
  "layer": "Language",
  "blurb": "From regular expressions and grammars (automata) to word vectors, transformers and large language models.",
  "topics": [
   {
    "id": "NL1",
    "t": "Text Processing & Linguistics",
    "h": 25,
    "w": "Language structure and n-gram models: the ancestors of LLMs.",
    "s": [
     "Regular expressions for text (from automata theory)",
     "Tokenization and normalization",
     "Morphology and stemming",
     "Part-of-speech tagging",
     "Syntactic parsing with CFGs",
     "N-gram language models",
     "Smoothing and perplexity"
    ],
    "r": [
     "Speech and Language Processing, Jurafsky & Martin, 3rd ed. draft (free)",
     "NLTK book (free)"
    ],
    "p": "Build an n-gram language model with smoothing and report perplexity on held-out text.",
    "pre": [
     "TC2",
     "MA4",
     "PR1"
    ]
   },
   {
    "id": "NL2",
    "t": "Classical NLP",
    "h": 20,
    "w": "Fast, cheap baselines you should always try first.",
    "s": [
     "Bag-of-words and TF-IDF",
     "Text classification with naive Bayes and logistic regression",
     "Sentiment analysis",
     "Sequence labeling with HMMs and CRFs",
     "Named entity recognition",
     "Information extraction"
    ],
    "r": [
     "Jurafsky & Martin chapters 4–5, 8, 17",
     "spaCy course (free)"
    ],
    "p": "Build a spam classifier for your own email exports and measure precision and recall.",
    "pre": [
     "NL1",
     "ML5"
    ]
   },
   {
    "id": "NL3",
    "t": "Word Embeddings",
    "h": 15,
    "w": "The first time meaning became geometry.",
    "s": [
     "Distributional semantics",
     "word2vec: skip-gram and CBOW",
     "Negative sampling",
     "GloVe and fastText",
     "Analogy and similarity evaluation",
     "Bias in embeddings"
    ],
    "r": [
     "CS224n lectures 1–2",
     "The word2vec papers",
     "Jay Alammar: The Illustrated Word2vec"
    ],
    "p": "Train word2vec on a corpus and explore analogies and nearest neighbors.",
    "pre": [
     "NL2"
    ]
   },
   {
    "id": "NL4",
    "t": "Neural NLP",
    "h": 20,
    "w": "How neural sequence models changed translation and language modeling.",
    "s": [
     "RNN language models",
     "Neural machine translation",
     "Attention for alignment",
     "Contextual embeddings (ELMo)",
     "Subword tokenization: BPE, WordPiece, SentencePiece"
    ],
    "r": [
     "Stanford CS224n (free lectures)",
     "Jurafsky & Martin chapters 9–13"
    ],
    "p": "Implement byte-pair encoding from scratch and train a tokenizer.",
    "pre": [
     "NL3",
     "DL5"
    ]
   },
   {
    "id": "NL5",
    "t": "Pretrained Transformers",
    "h": 30,
    "w": "BERT, GPT and T5 made transfer learning the default in NLP.",
    "s": [
     "BERT and masked language modeling",
     "GPT and causal language modeling",
     "T5 and text-to-text",
     "Fine-tuning for classification and QA",
     "Hugging Face transformers and datasets",
     "Sentence embeddings"
    ],
    "r": [
     "Hugging Face NLP Course (free)",
     "CS224n pretraining lectures",
     "Natural Language Processing with Transformers, Tunstall et al."
    ],
    "p": "Fine-tune a small BERT model for a classification task and deploy it as an API.",
    "pre": [
     "NL4",
     "DL6"
    ]
   },
   {
    "id": "NL6",
    "t": "Large Language Models",
    "h": 40,
    "w": "The most important technology shift of this decade.",
    "s": [
     "Scaling laws",
     "Pretraining data and data quality",
     "Instruction tuning",
     "RLHF and DPO",
     "In-context learning and prompting",
     "Reasoning and chain-of-thought",
     "Evaluation and benchmarks",
     "Hallucination and grounding",
     "Long context and efficient attention"
    ],
    "r": [
     "Karpathy: Intro to Large Language Models and Let's reproduce GPT-2",
     "Stanford CS336 Language Modeling from Scratch",
     "Sebastian Raschka: Build a Large Language Model (From Scratch)"
    ],
    "p": "Reproduce GPT-2 (124M) training on a small budget following Karpathy's build-nanoGPT.",
    "pre": [
     "NL5"
    ]
   },
   {
    "id": "NL7",
    "t": "LLM Applications: RAG, Tools & Agents",
    "h": 30,
    "w": "How LLMs become useful products, like a smarter version of your Telegram bot.",
    "s": [
     "Prompt design and structured output",
     "Embeddings and vector databases",
     "Retrieval-augmented generation (RAG)",
     "Tool use and function calling",
     "Agent loops and planning",
     "Evaluating LLM applications",
     "Safety and prompt injection"
    ],
    "r": [
     "Anthropic and OpenAI API documentation",
     "LlamaIndex and LangChain docs",
     "Simon Willison's blog on LLM engineering"
    ],
    "p": "Add an LLM to your Telegram bot that answers questions about your own notes using RAG.",
    "pre": [
     "NL6"
    ]
   },
   {
    "id": "NL8",
    "t": "Speech Processing",
    "h": 20,
    "w": "Voice assistants, transcription and text-to-speech.",
    "s": [
     "Audio features: spectrograms and MFCC",
     "Connectionist temporal classification (CTC)",
     "End-to-end ASR (Whisper)",
     "Text-to-speech",
     "Speaker identification"
    ],
    "r": [
     "Jurafsky & Martin chapter 16",
     "Hugging Face Audio Course (free)",
     "The Whisper paper"
    ],
    "p": "Send voice notes to your Telegram bot and have the Pi transcribe them with Whisper.",
    "pre": [
     "NL4",
     "SP1"
    ]
   }
  ],
  "refs": [
   "roadmap.sh: AI Engineer, Prompt Engineering",
   "Stanford CS224n",
   "CS2023: Artificial Intelligence"
  ],
  "branch": true
 },
 {
  "code": "AI",
  "name": "Advanced & Frontier AI",
  "layer": "Frontier",
  "blurb": "Reinforcement learning, efficient systems, safety, and the research frontier.",
  "topics": [
   {
    "id": "AI1",
    "t": "Reinforcement Learning",
    "h": 50,
    "w": "How agents learn from rewards; used in game AI, robotics and RLHF.",
    "s": [
     "Markov decision processes",
     "Dynamic programming: value and policy iteration",
     "Monte Carlo and temporal-difference learning",
     "Q-learning and SARSA",
     "Deep Q-networks",
     "Policy gradients and REINFORCE",
     "Actor–critic methods",
     "PPO",
     "Model-based RL"
    ],
    "r": [
     "Reinforcement Learning: An Introduction, Sutton & Barto (free)",
     "David Silver's RL course (YouTube)",
     "OpenAI Spinning Up",
     "Hugging Face Deep RL Course"
    ],
    "p": "Train a PPO agent to solve LunarLander and plot its learning curve.",
    "pre": [
     "DL3",
     "MA4"
    ]
   },
   {
    "id": "AI2",
    "t": "GPU Programming for AI",
    "h": 30,
    "w": "Speed in modern AI comes from writing efficient kernels.",
    "s": [
     "CUDA programming model",
     "Thread blocks, warps and occupancy",
     "GPU memory hierarchy",
     "Writing a matrix-multiply kernel",
     "Profiling with Nsight",
     "Triton kernels"
    ],
    "r": [
     "Programming Massively Parallel Processors, Hwu, Kirk, El Hajj",
     "GPU MODE lectures (YouTube)",
     "OpenAI Triton tutorials"
    ],
    "p": "Write a tiled matmul kernel in CUDA or Triton and compare its speed with cuBLAS.",
    "pre": [
     "AR4",
     "SY2",
     "DL3"
    ]
   },
   {
    "id": "AI3",
    "t": "Efficient Training & Inference",
    "h": 30,
    "w": "Makes big models affordable to train and run.",
    "s": [
     "Quantization (int8, int4)",
     "Pruning and sparsity",
     "Distillation",
     "LoRA and parameter-efficient fine-tuning",
     "FlashAttention",
     "KV cache and speculative decoding",
     "Data, tensor and pipeline parallelism",
     "Inference serving (vLLM)",
     "Prefill vs decode, TTFT and tokens/second",
     "Continuous batching and PagedAttention",
     "Roofline model and arithmetic intensity"
    ],
    "r": [
     "MIT 6.5940 TinyML and Efficient Deep Learning (Song Han)",
     "The LoRA, QLoRA and FlashAttention papers",
     "Hugging Face PEFT documentation"
    ],
    "p": "Fine-tune a small open LLM with QLoRA on one GPU and serve it with vLLM.",
    "pre": [
     "AI2",
     "NL6"
    ]
   },
   {
    "id": "AI4",
    "t": "MLOps",
    "h": 20,
    "w": "Getting models into production and keeping them working.",
    "s": [
     "Experiment tracking",
     "Data and model versioning",
     "Model serving and APIs",
     "Monitoring and drift detection",
     "CI/CD for ML",
     "Feature stores"
    ],
    "r": [
     "Made With ML, Goku Mohandas (free)",
     "Designing Machine Learning Systems, Chip Huyen"
    ],
    "p": "Deploy one of your models with monitoring and an automatic retrain trigger.",
    "pre": [
     "DL3",
     "SV12"
    ]
   },
   {
    "id": "AI5",
    "t": "AI Engineering in Production",
    "h": 30,
    "w": "Turning LLMs into reliable products: evaluated, observed and affordable.",
    "s": [
     "Choosing models: open vs closed, cost vs quality",
     "Context engineering and prompt caching",
     "Structured outputs and constrained decoding",
     "LLM evaluation: deterministic, model-based, human",
     "Observability and tracing (Langfuse, LangSmith)",
     "Cost and latency monitoring",
     "Model Context Protocol: building MCP servers and clients",
     "Multi-agent systems and memory",
     "Guardrails and content moderation"
    ],
    "r": [
     "roadmap.sh: AI Engineer and AI Agents roadmaps",
     "AI Engineering, Chip Huyen",
     "Anthropic's Building Effective Agents (blog)",
     "Model Context Protocol documentation"
    ],
    "p": "Ship your Telegram bot's LLM features with an eval suite, tracing and a cost dashboard.",
    "pre": [
     "NL7",
     "AI4"
    ]
   },
   {
    "id": "AI6",
    "t": "AI Security & Red Teaming",
    "h": 20,
    "w": "Attacking and defending AI systems, a fast-growing field.",
    "s": [
     "Prompt injection: direct and indirect",
     "Jailbreaks and safety-filter bypasses",
     "Data poisoning",
     "Model inversion and membership inference",
     "Model extraction and weight theft",
     "Agentic AI security: tool misuse, excessive permissions",
     "Red-teaming methodology and reporting"
    ],
    "r": [
     "roadmap.sh: AI Red Teaming roadmap",
     "OWASP Top 10 for LLM Applications",
     "Gandalf (Lakera) prompt-injection game"
    ],
    "p": "Red-team your own bot's LLM features and fix every injection you find.",
    "pre": [
     "NL7",
     "SC3"
    ]
   },
   {
    "id": "AI7",
    "t": "Edge AI & TinyML",
    "h": 20,
    "w": "Running models on phones, Pis and microcontrollers instead of the cloud.",
    "s": [
     "Model formats: ONNX, TFLite, Core ML",
     "Quantization for edge devices",
     "Running models on a Raspberry Pi",
     "Accelerators: Coral TPU, Jetson, NPUs",
     "TinyML on microcontrollers (TensorFlow Lite Micro)",
     "Benchmarking power and latency"
    ],
    "r": [
     "TinyML, Warden & Situnayake",
     "Edge Impulse documentation",
     "MIT 6.5940 TinyML"
    ],
    "p": "Run a keyword-spotting or image model on your Pi (and a microcontroller) and measure latency and power.",
    "pre": [
     "EM2",
     "DL3",
     "AI3"
    ]
   },
   {
    "id": "AI8",
    "t": "AI Safety, Alignment & Interpretability",
    "h": 30,
    "w": "Making powerful AI systems understandable, robust and beneficial.",
    "s": [
     "Adversarial examples and robustness",
     "Specification gaming and reward hacking",
     "RLHF and its limits",
     "Mechanistic interpretability: circuits and features",
     "Sparse autoencoders",
     "Evaluations and red-teaming",
     "Fairness, privacy and societal impact"
    ],
    "r": [
     "AI Safety Fundamentals (BlueDot Impact, free)",
     "Anthropic's interpretability research (Transformer Circuits thread)",
     "ARENA curriculum (free)"
    ],
    "p": "Train a small transformer and find a circuit inside it with TransformerLens.",
    "pre": [
     "NL6",
     "AI1"
    ]
   },
   {
    "id": "AI9",
    "t": "Frontier Topics",
    "h": 40,
    "w": "Where the field is heading right now.",
    "s": [
     "Reasoning models and test-time compute",
     "Mixture of experts",
     "State space models (Mamba)",
     "Multimodal foundation models",
     "Agents and computer use",
     "World models",
     "Robotics and embodied AI"
    ],
    "r": [
     "arXiv, Papers with Code and Hugging Face daily papers",
     "Lilian Weng's and Sebastian Raschka's blogs",
     "Lecture series from top labs and universities"
    ],
    "p": "Pick one frontier paper per month and write a summary with a small reproduction.",
    "pre": [
     "AI8",
     "NL6"
    ]
   },
   {
    "id": "AI10",
    "t": "Research Skills",
    "h": 25,
    "w": "Turns you from a consumer of AI into someone who can push it forward.",
    "s": [
     "Reading papers efficiently (three-pass method)",
     "Reproducing results",
     "Designing experiments and ablations",
     "Statistics for experiment results",
     "Writing papers and technical blog posts",
     "Open-source contribution"
    ],
    "r": [
     "How to Read a Paper, S. Keshav",
     "Andrej Karpathy and Chris Olah blog posts on research taste",
     "Papers with Code"
    ],
    "p": "Reproduce one recent paper end to end and publish your write-up and code.",
    "pre": [
     "DL6"
    ]
   }
  ],
  "refs": [
   "roadmap.sh: AI Engineer, AI Agents, MLOps, Inference Engineering, AI Red Teaming",
   "CS2023: Artificial Intelligence"
  ],
  "branch": true
 },
 {
  "code": "XF",
  "name": "Further Fields of CS",
  "layer": "Horizon",
  "blurb": "The rest of computer science. Pick these up as electives whenever one becomes relevant.",
  "topics": [
   {
    "id": "XF1",
    "t": "Computer Graphics",
    "h": 40,
    "w": "How images, games and 3D tools are rendered, and the origin of GPUs.",
    "s": [
     "Rasterization and the graphics pipeline",
     "Transformations and homogeneous coordinates",
     "Shading and lighting models",
     "Textures and sampling",
     "Ray tracing",
     "Physically based rendering",
     "Shaders (GLSL) and OpenGL/Vulkan/WebGPU",
     "Animation and simulation basics"
    ],
    "r": [
     "Ray Tracing in One Weekend series (free)",
     "LearnOpenGL (free)",
     "Fundamentals of Computer Graphics, Marschner & Shirley",
     "Scratchapixel (free)"
    ],
    "p": "Write a ray tracer from scratch, then a small real-time renderer with shaders.",
    "pre": [
     "MA1",
     "PR2"
    ]
   },
   {
    "id": "XF2",
    "t": "AR/VR & Spatial Computing",
    "h": 20,
    "w": "Graphics, vision and HCI combined in headsets and phones.",
    "s": [
     "Stereo rendering and latency",
     "Head and hand tracking",
     "SLAM for AR",
     "Interaction design in 3D",
     "OpenXR and WebXR",
     "Comfort and motion sickness"
    ],
    "r": [
     "WebXR documentation",
     "Unity or Godot XR tutorials"
    ],
    "p": "Build a small WebXR scene you can open on a phone.",
    "pre": [
     "XF1",
     "SP5"
    ]
   },
   {
    "id": "XF3",
    "t": "Programming Language Theory",
    "h": 35,
    "w": "Why languages are designed the way they are, and how to reason about programs.",
    "s": [
     "Lambda calculus",
     "Operational semantics",
     "Type systems and type inference (Hindley–Milner)",
     "Polymorphism and generics theory",
     "Algebraic data types and pattern matching",
     "Effects, monads and continuations",
     "Memory safety by construction (Rust's model)"
    ],
    "r": [
     "Types and Programming Languages, Benjamin Pierce",
     "Programming Languages, Dan Grossman (Coursera / UW)",
     "Software Foundations (free)"
    ],
    "p": "Implement a typed lambda calculus interpreter with type inference.",
    "pre": [
     "SY3"
    ]
   },
   {
    "id": "XF4",
    "t": "Formal Methods & Verification",
    "h": 30,
    "w": "Proving software and hardware correct, used for chips, crypto and aerospace.",
    "s": [
     "Specification and invariants",
     "Model checking",
     "TLA+",
     "SAT and SMT solvers (Z3)",
     "Proof assistants: Coq/Rocq and Lean",
     "Verified compilers and kernels (CompCert, seL4)",
     "Hardware verification"
    ],
    "r": [
     "Learn TLA+ and Specifying Systems, Leslie Lamport",
     "Software Foundations (free)",
     "Z3 tutorial",
     "Theorem Proving in Lean 4 (free)"
    ],
    "p": "Model your Telegram bot's reminder state machine in TLA+ and check it for bugs.",
    "pre": [
     "TC4"
    ]
   },
   {
    "id": "XF5",
    "t": "Human–Computer Interaction & UX",
    "h": 20,
    "w": "Software is only useful if people can use it.",
    "s": [
     "User research and interviews",
     "Usability heuristics",
     "Prototyping and wireframes",
     "Accessibility (WCAG)",
     "Visual and interaction design basics",
     "Usability testing and A/B tests"
    ],
    "r": [
     "The Design of Everyday Things, Don Norman",
     "Nielsen Norman Group articles",
     "Laws of UX"
    ],
    "p": "Run usability tests with 3 people on your progress dashboard and redesign based on what you see.",
    "pre": [
     "SE7"
    ]
   },
   {
    "id": "XF6",
    "t": "Ethics, Law & Professional Practice",
    "h": 15,
    "w": "Engineers' decisions affect people; the law and professional codes set the baseline.",
    "s": [
     "ACM Code of Ethics",
     "Intellectual property: copyright, patents, trade secrets",
     "Open-source licenses (MIT, GPL, Apache)",
     "Privacy and data-protection law",
     "Computer misuse law (CFAA) and responsible disclosure",
     "AI ethics and accountability",
     "Accessibility and inclusion"
    ],
    "r": [
     "ACM Code of Ethics and Professional Conduct",
     "OSSU Core ethics courses",
     "A Gift of Fire, Sara Baase"
    ],
    "p": "Pick the right license for your curriculum repo and write a responsible-disclosure policy for your projects.",
    "pre": [
     "OR1"
    ]
   },
   {
    "id": "XF7",
    "t": "Mobile Development",
    "h": 30,
    "w": "Phones are the most used computers in the world.",
    "s": [
     "Android app architecture",
     "Kotlin and Jetpack Compose",
     "Cross-platform: Flutter or React Native",
     "Local storage and sync",
     "Push notifications",
     "Permissions and sensors",
     "Publishing to app stores"
    ],
    "r": [
     "Android Developers official courses (free)",
     "Flutter documentation"
    ],
    "p": "Build an Android app that shows your learning progress from the Pi and sends daily study nudges.",
    "pre": [
     "SE7"
    ]
   },
   {
    "id": "XF8",
    "t": "Quantum Computing",
    "h": 30,
    "w": "A different model of computation with real consequences for cryptography.",
    "s": [
     "Qubits, superposition and measurement",
     "Quantum gates and circuits",
     "Entanglement",
     "Deutsch–Jozsa and Bernstein–Vazirani",
     "Grover's search",
     "Shor's algorithm and its threat to RSA",
     "Quantum error correction basics",
     "Programming with Qiskit"
    ],
    "r": [
     "Quantum Computation and Quantum Information, Nielsen & Chuang",
     "IBM Quantum Learning (free)",
     "Quantum Country, Matuschak & Nielsen (free)"
    ],
    "p": "Implement Grover's search in Qiskit and run it on a real IBM quantum device.",
    "pre": [
     "MA1",
     "MA4"
    ]
   },
   {
    "id": "XF9",
    "t": "Scientific & High-Performance Computing",
    "h": 25,
    "w": "Simulations, weather, physics and the supercomputers behind them.",
    "s": [
     "Numerical simulation basics",
     "Vectorized computing with NumPy and Numba",
     "MPI for clusters",
     "Job schedulers (Slurm)",
     "Parallel I/O and file formats (HDF5)",
     "Visualization of large data"
    ],
    "r": [
     "Introduction to High Performance Computing for Scientists and Engineers, Hager & Wellein",
     "HPC Carpentry lessons (free)"
    ],
    "p": "Write a heat-diffusion simulation, parallelize it with MPI, and measure its scaling.",
    "pre": [
     "SY2",
     "MA8"
    ]
   },
   {
    "id": "XF10",
    "t": "Computational Biology & Bioinformatics",
    "h": 20,
    "w": "Algorithms and ML applied to DNA, proteins and medicine.",
    "s": [
     "DNA, RNA and proteins for programmers",
     "Sequence alignment (Needleman–Wunsch, Smith–Waterman, BLAST)",
     "Genome assembly",
     "Phylogenetics",
     "Protein structure prediction (AlphaFold)",
     "Biological data formats and tools (Biopython)"
    ],
    "r": [
     "Bioinformatics Algorithms, Compeau & Pevzner (+ Rosalind problems)",
     "Rosalind (free practice)"
    ],
    "p": "Solve 30 Rosalind problems and implement Smith–Waterman alignment.",
    "pre": [
     "DS6",
     "ML2"
    ]
   },
   {
    "id": "XF11",
    "t": "Algorithmic Game Theory",
    "h": 15,
    "w": "How self-interested agents interact: auctions, markets, networks and multi-agent AI.",
    "s": [
     "Normal-form games and Nash equilibrium",
     "Zero-sum games and minimax",
     "Mechanism design",
     "Auctions (first-price, second-price, VCG)",
     "Price of anarchy",
     "Stable matching"
    ],
    "r": [
     "Twenty Lectures on Algorithmic Game Theory, Tim Roughgarden",
     "Stanford Game Theory (Coursera)"
    ],
    "p": "Simulate an auction with strategic bidders and show why second-price auctions are truthful.",
    "pre": [
     "DS6",
     "MA4"
    ]
   },
   {
    "id": "XF12",
    "t": "Game Development",
    "h": 30,
    "w": "Combines graphics, physics, AI, audio and real-time systems in one product.",
    "s": [
     "The game loop and frame timing",
     "Entity-component-system design",
     "2D/3D physics and collision",
     "Game AI: pathfinding, state machines, behavior trees",
     "Audio",
     "Engines: Godot or Unity",
     "Networking for multiplayer"
    ],
    "r": [
     "Game Programming Patterns, Robert Nystrom (free)",
     "Godot documentation",
     "Real-Time Collision Detection, Christer Ericson"
    ],
    "p": "Build and ship a small original game in Godot.",
    "pre": [
     "XF1",
     "ML1"
    ]
   },
   {
    "id": "XF13",
    "t": "Robotics & Autonomous Systems",
    "h": 40,
    "w": "Putting perception, planning and control together on real machines.",
    "s": [
     "Rigid-body transforms and kinematics",
     "Motion planning: RRT, PRM, A*",
     "Localization and SLAM",
     "Sensor fusion with Kalman filters",
     "Perception for robots",
     "ROS 2 in depth",
     "Learning-based control"
    ],
    "r": [
     "Modern Robotics, Lynch & Park (free + Coursera)",
     "Probabilistic Robotics, Thrun, Burgard, Fox",
     "ROS 2 tutorials"
    ],
    "p": "Build or simulate a robot that maps a room and navigates to a goal in ROS 2.",
    "pre": [
     "EM9",
     "SP5",
     "ML1"
    ]
   },
   {
    "id": "XF14",
    "t": "Blockchain & Distributed Ledgers",
    "h": 15,
    "w": "Applied cryptography plus distributed consensus, with real tradeoffs.",
    "s": [
     "Hash chains and Merkle trees",
     "Proof of work and proof of stake",
     "Byzantine fault tolerance",
     "Smart contracts",
     "Smart contract vulnerabilities",
     "Where blockchains help and where they don't"
    ],
    "r": [
     "Bitcoin and Cryptocurrency Technologies, Narayanan et al. (free)",
     "Mastering Ethereum (free)"
    ],
    "p": "Build a toy blockchain with proof of work and a Merkle tree in Python.",
    "pre": [
     "SC2",
     "SY7"
    ]
   },
   {
    "id": "XF15",
    "t": "Technical Writing & Communication",
    "h": 10,
    "w": "Clear writing is how engineers get things built, reviewed and funded.",
    "s": [
     "Writing design documents",
     "Writing READMEs and documentation",
     "Explaining technical ideas simply",
     "Code review etiquette",
     "Giving technical talks"
    ],
    "r": [
     "Google Technical Writing courses (free)",
     "Docs for Developers, Bhatti et al."
    ],
    "p": "Write a design doc for your Telegram bot and a README for your curriculum repo.",
    "pre": [
     "OR3"
    ]
   },
   {
    "id": "XF16",
    "t": "Career Skills: Portfolio, Interviews & Open Source",
    "h": 20,
    "w": "Turns everything you learned into jobs, collaborators and opportunities.",
    "s": [
     "Building a portfolio from your projects",
     "Writing a strong resume",
     "Coding interview practice",
     "System design interviews",
     "Behavioral interviews",
     "Contributing to open source",
     "Networking and finding mentors"
    ],
    "r": [
     "Cracking the Coding Interview, Gayle McDowell",
     "NeetCode roadmap",
     "First Contributions (GitHub)"
    ],
    "p": "Publish a portfolio site linking your 10 best projects from this roadmap.",
    "pre": [
     "SE6",
     "DS6"
    ]
   }
  ],
  "refs": [
   "roadmap.sh: Game Developer, Blockchain, Android, Flutter, UX Design, Technical Writer",
   "OSSU: Graphics, Core ethics, Advanced theory",
   "CS2023: Graphics, HCI, Society Ethics and the Profession, Specialized Platform Development"
  ],
  "branch": true
 }
];
