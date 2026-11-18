import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@divineskins/ui";

interface ParameterListProps {
  name: string;
  description: string;
}

export function ParameterList({
  parameters,
}: {
  parameters: ParameterListProps[];
}) {
  return (
    <Card padding="none" className="not-prose my-6 overflow-hidden">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-48">Name</TableHead>

            <TableHead className="grow">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parameters.map((parameter) => (
            <TableRow key={parameter.name}>
              <TableCell className="font-medium">{parameter.name}</TableCell>
              <TableCell className="whitespace-normal!">
                {parameter.description}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
