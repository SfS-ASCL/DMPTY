#!/usr/bin/perl

# C. Zinn, University of Tuebingen

use CGI;

$CGI::POST_MAX = 1024 * 5000;
my $buf_size = 4096;
my $file_in = '/tmp/dmf.html'; # not in /www!
my $file_out = '/tmp/dmf.tex';
my $query = new CGI;

sub dienice {
    (my $errmsg) = @_;
    print $query->header();
    print "Content-Type: text/html\n\n";
    print "<h2>Error</h2>\n";
    print "$errmsg<p>\n";
    print "</body></html>\n";
    exit;
}

open ( my $fh, '>', $file_in) or &dienice("Could not open file - $file_in -");
print $fh $query->param( 'POSTDATA' );
close $fh;

# convert using pandoc
`/usr/local/bin/pandoc -f html -t latex $file_in -o $file_out`;

# send the converted file back!
open( my $convFile, '<', $file_out ) or &dienice("open of converted file failed: $!");
binmode($convFile);

#x-latex
print $query->header(
    -type    => '/application/x-latex', 
    -expires => '-1d'
    );

# none of the formats supported is in binary
binmode(STDOUT);

my $buf;
while ( read($convFile, $buf, $buf_size) ) { print $buf; }

1;
