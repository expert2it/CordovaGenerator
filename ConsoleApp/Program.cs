using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp
{
    public class Program
    {
        private static Process process;
        public static void Main()
        {
            handler = new ConsoleEventDelegate(ConsoleEventCallback);
            SetConsoleCtrlHandler(handler, true);

            processStart();
            //Do(1);
        }
        public static void Do(int idx) {
            do
            {
                var command = Console.ReadLine();
                Run(command);
            } while (idx == 1);
        }
        public static bool ConsoleEventCallback(int eventType)
        {
            if (eventType == 0)
            {
                Console.WriteLine("CTRL + Break");
                Do(1);
            }
            return false;
        }
        static ConsoleEventDelegate handler;   // Keeps it from getting garbage collected
                                               // Pinvoke
        public delegate bool ConsoleEventDelegate(int eventType);
        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern bool SetConsoleCtrlHandler(ConsoleEventDelegate callback, bool add);

        public static void processStart()
        {
            //using (process = new Process())
            {
                process = new Process();
                process.StartInfo =
                            new ProcessStartInfo("cmd.exe")
                            {
                                RedirectStandardInput = true,
                                RedirectStandardOutput = true,
                                RedirectStandardError = true,
                                UseShellExecute = false
                            };
                process.OutputDataReceived += new DataReceivedEventHandler(process_OutputDataReceived);
                process.ErrorDataReceived += new DataReceivedEventHandler(process_ErrorDataReceived);
                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();
            }
        }
        public static void process_OutputDataReceived(object sendingProcess, DataReceivedEventArgs outLine)
        {
            process_write(outLine);
        }
        public static void process_ErrorDataReceived(object sendingProcess, DataReceivedEventArgs outLine)
        {
            process_write(outLine);
        }
        public static string process_write(DataReceivedEventArgs outLine)
        {
            if (outLine.Data != null)
            {
                return outLine.Data;
            }
            return "empty...";
        }
        public static void Run(string command)
        {
            process.StandardInput.WriteLine(command);
        }
    }
}
