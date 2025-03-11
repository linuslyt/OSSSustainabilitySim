export const COLUMN_DETAILS = {
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
};

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
