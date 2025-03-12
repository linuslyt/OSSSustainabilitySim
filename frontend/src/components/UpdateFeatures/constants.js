export const FEATURE_DESCRIPTIONS = new Map(
  Object.entries({
    //
    month: 'Month',
    // Basics
    active_devs:
      '# of contributors who have made commits or participated in discussions',
    num_commits: '# of source code commits made by all committers',
    num_files: '# of unique source code files created during incubation',
    num_emails: '# of emails (incl. thread starter and reply-to emails)',
    // Contribution distribution
    c_percentage: '% of commits made by top 10% of contributors',
    e_percentage: '% of emails made by top 10% of contributors',
    // Activity continuity
    inactive_c:
      'sum of the time intervals of the top 3 longest interruptions between successive commits',
    inactive_e:
      'sum of the time intervals of the top 3 longest interruptions between successive emails',
    // Commit network
    c_nodes: 'nodes in technical network',
    c_edges: 'edges in technical network',
    c_c_coef: 'clustering coefficient of technical network',
    c_mean_degree: 'mean node degree of technical network',
    c_long_tail:
      'long-tailedness of technical network (degree of the 75th percentile of nodes)',
    // Email network
    e_nodes: 'nodes in social network',
    e_edges: 'edges in social network',
    e_c_coef: 'clustering coefficient of social network',
    e_mean_degree: 'mean node degree of social network',
    e_long_tail:
      'long-tailedness of social network (degree of the 75th percentile of nodes)',
  }),
);

export const FEATURE_TYPES = new Map(
  Object.entries({
    //
    month: 'INTEGER',
    // Basics
    active_devs: 'INTEGER',
    num_commits: 'INTEGER',
    num_files: 'INTEGER',
    num_emails: 'INTEGER',
    // Contribution distribution
    c_percentage: 'FLOAT',
    e_percentage: 'FLOAT',
    // Activity continuity
    inactive_c: 'INTEGER',
    inactive_e: 'INTEGER',
    // Commit network
    c_nodes: 'INTEGER',
    c_edges: 'INTEGER',
    c_c_coef: 'FLOAT',
    c_mean_degree: 'FLOAT',
    c_long_tail: 'FLOAT',
    // Email network
    e_nodes: 'INTEGER',
    e_edges: 'INTEGER',
    e_c_coef: 'FLOAT',
    e_mean_degree: 'FLOAT',
    e_long_tail: 'FLOAT',
  }),
);

export const FEATURE_ORDER = [
  'active_devs',
  'num_commits',
  'num_files',
  'num_emails',
  'c_percentage',
  'e_percentage',
  'inactive_c',
  'inactive_e',
  'c_nodes',
  'c_edges',
  'c_c_coef',
  'c_mean_degree',
  'c_long_tail',
  'e_nodes',
  'e_edges',
  'e_c_coef',
  'e_mean_degree',
  'e_long_tail',
];

/* --- Dummy data --- */
export const DUMMY_DATA = [
  {
    month: 1,
    active_devs: 10,
    num_commits: 50,
    num_files: 20,
    num_emails: 15,
    c_percentage: 0.7,
    e_percentage: 0.3,
    inactive_c: 5,
    inactive_e: 2,
    c_nodes: 30,
    c_edges: 50,
    c_c_coef: 0.6,
    c_mean_degree: 2.5,
    c_long_tail: 0.1,
    e_nodes: 25,
    e_edges: 40,
    e_c_coef: 0.55,
    e_mean_degree: 2,
    e_long_tail: 0.05,
  },
  {
    month: 2,
    active_devs: 10,
    num_commits: 100,
    num_files: 26,
    num_emails: 13,
    c_percentage: 0.78,
    e_percentage: 0.34,
    inactive_c: 6,
    inactive_e: 3,
    c_nodes: 32,
    c_edges: 54,
    c_c_coef: 0.7,
    c_mean_degree: 2.8,
    c_long_tail: 0.4,
    e_nodes: 26,
    e_edges: 44,
    e_c_coef: 0.5,
    e_mean_degree: 3,
    e_long_tail: 0.15,
  },
  {
    month: 3,
    active_devs: 10,
    num_commits: 50,
    num_files: 20,
    num_emails: 15,
    c_percentage: 0.7,
    e_percentage: 0.3,
    inactive_c: 5,
    inactive_e: 2,
    c_nodes: 30,
    c_edges: 50,
    c_c_coef: 0.6,
    c_mean_degree: 2.5,
    c_long_tail: 0.1,
    e_nodes: 25,
    e_edges: 40,
    e_c_coef: 0.55,
    e_mean_degree: 2,
    e_long_tail: 0.05,
  },
  {
    month: 4,
    active_devs: 10,
    num_commits: 100,
    num_files: 26,
    num_emails: 13,
    c_percentage: 0.78,
    e_percentage: 0.34,
    inactive_c: 6,
    inactive_e: 3,
    c_nodes: 32,
    c_edges: 54,
    c_c_coef: 0.7,
    c_mean_degree: 2.8,
    c_long_tail: 0.4,
    e_nodes: 26,
    e_edges: 44,
    e_c_coef: 0.5,
    e_mean_degree: 3,
    e_long_tail: 0.15,
  },
  {
    month: 5,
    active_devs: 10,
    num_commits: 100,
    num_files: 26,
    num_emails: 13,
    c_percentage: 0.78,
    e_percentage: 0.34,
    inactive_c: 6,
    inactive_e: 3,
    c_nodes: 32,
    c_edges: 54,
    c_c_coef: 0.7,
    c_mean_degree: 2.8,
    c_long_tail: 0.4,
    e_nodes: 26,
    e_edges: 44,
    e_c_coef: 0.5,
    e_mean_degree: 3,
    e_long_tail: 0.15,
  },
];

export const DUMMY_CHANGES = [
  {
    id: '3-num_commits',
    change: {
      month: 3,
      feature: 'num_commits',
      new_value: 10,
    },
  },
  {
    id: '1-num_commits',
    change: {
      month: 1,
      feature: 'num_commits',
      new_value: 10,
    },
  },
];
